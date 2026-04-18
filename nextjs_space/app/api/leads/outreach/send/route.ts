import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

interface SendItem {
  leadId: string
  subject: string
  body: string
  recipient?: string // optional override; otherwise uses lead.contactEmail
}

interface SendBody {
  items: SendItem[]
  senderName: string
  senderCompany: string
  senderReplyEmail?: string // user's email to include in signature so replies work
}

/**
 * POST /api/leads/outreach/send
 *
 * Sends outreach emails for each `item`. Uses Abacus.AI notification email API.
 * Returns a per-item result array — caller can show success/failure per lead.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!process.env.ABACUSAI_API_KEY || !process.env.WEB_APP_ID || !process.env.NOTIF_ID_LEAD_OUTREACH_EMAIL) {
      return NextResponse.json(
        { error: 'Email service not configured on the server' },
        { status: 503 }
      )
    }

    const payload = (await req.json().catch(() => null)) as SendBody | null
    if (!payload || !Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: 'No items to send' }, { status: 400 })
    }
    if (payload.items.length > 50) {
      return NextResponse.json({ error: 'Max 50 emails per batch' }, { status: 400 })
    }
    const senderName = (payload.senderName || session.user.name || 'SolarScout user').slice(0, 120)
    const senderCompany = (payload.senderCompany || '').slice(0, 120)
    const replyEmail = (payload.senderReplyEmail || session.user.email || '').slice(0, 120)

    const leadIds = payload.items.map((i) => i.leadId)
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId },
      select: {
        id: true,
        businessName: true,
        contactEmail: true,
      },
    })
    const leadById = new Map(leads.map((l) => [l.id, l]))

    // Derive sender email / alias from NEXTAUTH_URL
    const appUrl = process.env.NEXTAUTH_URL || ''
    let senderEmail = 'noreply@mail.abacusai.app'
    let senderAlias = senderName
    try {
      if (appUrl) {
        senderEmail = `noreply@${new URL(appUrl).hostname}`
      }
    } catch {}
    if (senderCompany) senderAlias = `${senderName} · ${senderCompany}`

    // Iterate serially to respect rate limits and keep the total request bounded
    const results: Array<{
      leadId: string
      ok: boolean
      recipient?: string
      error?: string
      skipped?: boolean
    }> = []

    for (const item of payload.items) {
      const lead = leadById.get(item.leadId)
      if (!lead) {
        results.push({ leadId: item.leadId, ok: false, error: 'Lead not found or not yours' })
        continue
      }
      const recipient = (item.recipient || lead.contactEmail || '').trim()
      if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        results.push({
          leadId: item.leadId,
          ok: false,
          skipped: true,
          error: 'No valid email on this lead',
        })
        continue
      }

      const finalBody = buildHtmlBody(item.body, { senderName, senderCompany, replyEmail })

      try {
        const res = await fetch('https://apps.abacus.ai/api/sendNotificationEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deployment_token: process.env.ABACUSAI_API_KEY,
            app_id: process.env.WEB_APP_ID,
            notification_id: process.env.NOTIF_ID_LEAD_OUTREACH_EMAIL,
            subject: item.subject.slice(0, 250),
            body: finalBody,
            is_html: true,
            recipient_email: recipient,
            sender_email: senderEmail,
            sender_alias: senderAlias,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.success === false) {
          if (data?.notification_disabled) {
            results.push({
              leadId: item.leadId,
              ok: false,
              skipped: true,
              error: 'Notifications disabled by user',
            })
          } else {
            results.push({
              leadId: item.leadId,
              ok: false,
              error: data?.message || `HTTP ${res.status}`,
            })
          }
          continue
        }

        // Mark the lead as CONTACTED (soft-advance the pipeline)
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: 'CONTACTED' },
        }).catch(() => null)

        results.push({ leadId: item.leadId, ok: true, recipient })
      } catch (err: any) {
        results.push({
          leadId: item.leadId,
          ok: false,
          error: err?.message || 'send failed',
        })
      }
    }

    const sent = results.filter((r) => r.ok).length
    const failed = results.filter((r) => !r.ok && !r.skipped).length
    const skipped = results.filter((r) => r.skipped).length

    return NextResponse.json({
      total: results.length,
      sent,
      failed,
      skipped,
      results,
    })
  } catch (err: any) {
    console.error('[api/leads/outreach/send] error', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to send outreach', details: err?.message || String(err) },
      { status: 500 }
    )
  }
}

function buildHtmlBody(
  rawBody: string,
  ctx: { senderName: string; senderCompany: string; replyEmail: string }
): string {
  // Replace [Your name] / [Your company] placeholders with the user's real values
  let processed = rawBody
    .replace(/\[Your name\]/gi, ctx.senderName)
    .replace(/\[Your company\]/gi, ctx.senderCompany || ctx.senderName)

  // Escape HTML characters from the plain-text body, then convert newlines
  const escaped = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const htmlParagraphs = escaped
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 14px;line-height:1.55">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')

  const signatureHtml = `<div style="margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.55">
    <strong style="color:#111827">${escapeHtml(ctx.senderName)}</strong>${ctx.senderCompany ? ` · ${escapeHtml(ctx.senderCompany)}` : ''}
    ${ctx.replyEmail ? `<br/><a href="mailto:${escapeHtml(ctx.replyEmail)}" style="color:#d97706;text-decoration:none">${escapeHtml(ctx.replyEmail)}</a>` : ''}
  </div>`

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;color:#1f2937;font-size:14px">
    ${htmlParagraphs}
    ${signatureHtml}
  </div>`
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
