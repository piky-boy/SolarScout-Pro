import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logActivity } from '@/lib/activity'
import {
  computeBusinessCase,
  OUTREACH_TONES,
  SUPPORTED_LANGUAGES,
  type OutreachLanguage,
  type OutreachTone,
} from '@/lib/outreach'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const LLM_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini'

const outreachSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'Compelling subject line, under 80 chars.' },
        body: {
          type: 'string',
          description:
            'Full email body, plain text, 120-180 words. Greeting, hook, business case with numbers, soft CTA, sign-off with [Your name]/[Your company] placeholders.',
        },
      },
      required: ['subject', 'body'],
      additionalProperties: false,
    },
    call: {
      type: 'object',
      properties: {
        opener: { type: 'string', description: '1-2 sentence opener to greet and introduce yourself.' },
        keyPoints: {
          type: 'array',
          description: '3-5 bullet talking points, each one short sentence with a concrete number.',
          items: { type: 'string' },
        },
        objectionResponse: {
          type: 'string',
          description: 'One sentence rebuttal to the most likely objection (cost or disruption).',
        },
        closing: { type: 'string', description: '1-2 sentence closing asking for a meeting.' },
      },
      required: ['opener', 'keyPoints', 'objectionResponse', 'closing'],
      additionalProperties: false,
    },
    whatsapp: {
      type: 'string',
      description:
        'Short WhatsApp / SMS message. Max 350 chars. First-name friendly, ends with a soft question.',
    },
  },
  required: ['email', 'call', 'whatsapp'],
  additionalProperties: false,
} as const

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined
    if (!session?.user || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API is not configured on the server.' },
        { status: 503 }
      )
    }

    const lead = await prisma.lead.findFirst({
      where: { id, userId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = (await req.json().catch(() => ({}))) as {
      language?: OutreachLanguage
      tone?: OutreachTone
    }
    const language: OutreachLanguage = SUPPORTED_LANGUAGES.some((l) => l.code === body.language)
      ? (body.language as OutreachLanguage)
      : 'en'
    const tone: OutreachTone = OUTREACH_TONES.some((t) => t.code === body.tone)
      ? (body.tone as OutreachTone)
      : 'professional'

    const businessCase = computeBusinessCase({
      country: lead.country,
      panels: lead.solarMaxPanelCount,
      panelCapacityWatts: lead.solarPanelCapacityWatts,
      yearlyEnergyKwh: lead.solarYearlyEnergyKwh,
      panelLifetimeYears: lead.solarPanelLifetimeYears,
      carbonOffsetKgYr: lead.solarCarbonOffsetKgYr,
      roofAreaSqm: lead.roofAreaSqm,
    })

    const hasRealSolarData = lead.solarApiStatus === 'OK' && !!lead.solarYearlyEnergyKwh

    const factsForLlm = {
      business: {
        name: lead.businessName ?? 'this business',
        type: lead.businessType ?? 'commercial building',
        buildingType: lead.buildingType ?? null,
        city: lead.city ?? null,
        country: lead.country ?? null,
        address: lead.address ?? null,
        hasPhone: !!lead.contactPhone,
        hasEmail: !!lead.contactEmail,
        hasWebsite: !!lead.website,
        googleRating: lead.googleRating ?? null,
      },
      roof: {
        areaSqm: lead.roofAreaSqm ?? null,
      },
      solar: hasRealSolarData
        ? {
            source: 'Google Solar API',
            maxPanels: lead.solarMaxPanelCount,
            maxArrayAreaSqm: lead.solarMaxArrayAreaSqm,
            yearlyEnergyKwh: lead.solarYearlyEnergyKwh,
            peakSunshineHoursPerYear: lead.solarMaxSunshineHours,
            co2OffsetKgPerYear: lead.solarCarbonOffsetKgYr,
            panelCapacityWatts: lead.solarPanelCapacityWatts,
            panelLifetimeYears: lead.solarPanelLifetimeYears,
            imageryQuality: lead.solarImageryQuality,
            imageryDate: lead.solarImageryDate,
          }
        : { source: 'Estimate from roof area (no Solar API record yet)' },
      businessCase,
      seller: {
        name: lead.user?.name ?? null,
      },
    }

    const languageLabel =
      SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label ?? 'English'

    const systemPrompt = `You are a senior B2B sales copywriter for a European commercial solar installation firm (Spain, Portugal, Romania, Albania, United Kingdom). You write concise, high-conversion outreach that leads with concrete numbers and respects the reader's time. NEVER invent data — only use the facts provided. Round euro amounts to the nearest hundred. Write in ${languageLabel} (ISO code: ${language}). Tone: ${tone}. NEVER use emojis in the email or call script; a single subtle emoji in the WhatsApp message is OK. Use [Your name] and [Your company] as placeholders for the sender; never make them up.`

    const userPrompt = `Generate a complete outreach kit for this prospect. Facts:\n\n${JSON.stringify(factsForLlm, null, 2)}\n\nRules:\n- Lead every piece with the strongest business case number available (annual savings in € or payback years).\n- If real Google Solar API data is present, reference the panel count + yearly kWh.\n- If only an estimate is available, acknowledge it's a preliminary estimate.\n- Email body must feel human, not templated. Use the business name and city at least once.\n- Call script: 3-5 bullet key points, each with a number.\n- WhatsApp: under 350 characters, first-name greeting, ends with a low-commitment question.\n- Always end with suggesting a 15-minute discovery call or site visit, not a hard sell.\n\nReturn ONLY the JSON matching the schema.`

    const llmRes = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1800,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'outreach_kit',
            strict: true,
            schema: outreachSchema,
          },
        },
      }),
    })

    if (!llmRes.ok) {
      const errText = await llmRes.text()
      console.error('[outreach] OpenAI API error', llmRes.status, errText.slice(0, 500))
      return NextResponse.json(
        { error: 'LLM request failed', details: errText.slice(0, 300) },
        { status: 502 }
      )
    }

    const llmJson = await llmRes.json()
    const content: string | undefined = llmJson?.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'Empty LLM response' }, { status: 502 })
    }

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      console.error('[outreach] failed to parse JSON', content.slice(0, 400))
      return NextResponse.json({ error: 'Malformed LLM response' }, { status: 502 })
    }

    logActivity(userId, 'outreach_generated', { language, tone }, id)
    return NextResponse.json({
      language,
      tone,
      businessCase,
      hasRealSolarData,
      kit: parsed,
    })
  } catch (err: any) {
    console.error('[api/leads/:id/outreach] error', err?.message || err)
    return NextResponse.json(
      { error: 'Failed to generate outreach', details: err?.message || String(err) },
      { status: 500 }
    )
  }
}
