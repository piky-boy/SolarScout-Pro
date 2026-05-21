/**
 * Intent SEO — AI Agent
 *
 * Uses OpenAI (HTTP fetch, same pattern as /api/leads/[id]/outreach) to
 * generate dynamic content for an IntentLanding page:
 *
 *   - aiSearchQA    (8–12 Q&As optimised for AI Overviews / ChatGPT / Perplexity)
 *   - segments      (enriched with hook + stat per building type)
 *   - emotionalHook (single high-converting headline)
 *   - heroSubcopy   (2–3 sentence supporting copy under the hook)
 *   - seoCopy       (400–600 word body copy for on-page SEO)
 *   - socialProofClusters (3–5 stat blocks)
 */

import type { IntentLandingRecord, AISearchQA, IntentSegment, SocialProofCluster } from './intent-types'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini'

// ─── Language map ─────────────────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  ro: 'Romanian',
  sq: 'Albanian',
}

// ─── Output schema ────────────────────────────────────────────────────────────

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    emotionalHook: {
      type: 'string',
      description:
        'A single high-converting headline (8–15 words) that speaks to the pain/desire of a solar installer looking for leads in this city/market.',
    },
    heroSubcopy: {
      type: 'string',
      description:
        '2–3 sentences of supporting copy that reinforce the headline. Mention the city/country and a specific benefit (roof area, payback period, data quality).',
    },
    seoCopy: {
      type: 'string',
      description:
        '400–600 word SEO body copy. Include: why this market is a solar opportunity, what kinds of buildings are available, how SolarScout Pro helps, and a CTA. Use the city/country name naturally 4–6 times.',
    },
    aiSearchQA: {
      type: 'array',
      minItems: 8,
      maxItems: 12,
      description:
        'Conversational Q&A pairs optimised for AI Overviews, ChatGPT, and Perplexity. Each answer should be 2–4 sentences, factual, and citation-friendly.',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
    },
    segments: {
      type: 'array',
      description:
        'Enriched building-type segments. Fill in the hook (1 sentence) and stat (a specific statistic) for each segment.',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          label: { type: 'string' },
          hook: { type: 'string' },
          stat: { type: 'string' },
          ctaLabel: { type: 'string' },
          ctaHref: { type: 'string' },
          icon: { type: 'string' },
        },
        required: ['type', 'label', 'hook', 'stat', 'ctaLabel', 'ctaHref', 'icon'],
      },
    },
    socialProofClusters: {
      type: 'array',
      minItems: 3,
      maxItems: 5,
      description:
        '3–5 social proof stat blocks relevant to the solar market in this city/country. Use credible-sounding but general statistics.',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          label: { type: 'string' },
          sub: { type: 'string' },
        },
        required: ['value', 'label'],
      },
    },
  },
  required: ['emotionalHook', 'heroSubcopy', 'seoCopy', 'aiSearchQA', 'segments', 'socialProofClusters'],
  additionalProperties: false,
}

// ─── Agent output type ────────────────────────────────────────────────────────

export interface IntentAgentOutput {
  emotionalHook: string
  heroSubcopy: string
  seoCopy: string
  aiSearchQA: AISearchQA[]
  segments: IntentSegment[]
  socialProofClusters: SocialProofCluster[]
}

// ─── System prompt builder ────────────────────────────────────────────────────

function buildSystemPrompt(locale: string): string {
  const lang = LANGUAGE_NAMES[locale] ?? 'English'
  return `You are a senior B2B copywriter and SEO specialist for SolarScout Pro — an automated solar lead generation platform for European commercial installers.

Your task is to write high-converting, SEO-optimised content for a programmatic landing page targeting solar installation companies who want to find commercial leads in a specific city or country.

Rules:
- Write EXCLUSIVELY in ${lang}
- Every claim must be plausible and grounded — do not invent specific company names or fake statistics
- Use natural, active, persuasive language suited to B2B sales professionals
- The audience is: solar panel installers, solar sales reps, and solar company owners in Europe
- SolarScout Pro's value prop: automatically detects commercial buildings, warehouses, factories and retail parks using satellite data + OpenStreetMap, returns contact data and Google Solar API insights
- Avoid generic filler — every sentence should add value
- aiSearchQA answers must be structured for AI Overview citation (clear, factual, 2–4 sentences)`
}

// ─── User prompt builder ──────────────────────────────────────────────────────

function buildUserPrompt(page: IntentLandingRecord): string {
  const location = page.isHub
    ? `country: ${page.countryCode} (national hub page, no specific city)`
    : `city: ${page.city}, country: ${page.countryCode}`

  const segmentList = page.segments
    .map((s) => `- type="${s.type}", label="${s.label}", ctaLabel="${s.ctaLabel}", ctaHref="${s.ctaHref}", icon="${s.icon}"`)
    .join('\n')

  return `Generate full content for this Intent SEO landing page:

Page: ${page.title}
H1: ${page.h1}
Intent type: ${page.intentType}
Location: ${location}
Locale: ${page.locale}
Intro (already written, use as context): ${page.intro}
Existing FAQs (for context, do not repeat in aiSearchQA): ${page.faqs.map((f) => f.question).join('; ')}

Seed segments to enrich (return the same array with hook + stat filled in):
${segmentList}

For aiSearchQA, write questions that solar installers and Google/ChatGPT users would actually search, e.g.:
"How many commercial solar leads are there in ${page.city ?? page.countryCode}?"
"What is the solar payback period for warehouses in ${page.city ?? page.countryCode}?"
"How do I find solar installation leads in ${page.city ?? page.countryCode}?"

For seoCopy, structure as: opening value statement → market context → what SolarScout finds → how it works → CTA paragraph. Include the location name 4–6 times naturally.`
}

// ─── Main agent function ──────────────────────────────────────────────────────

export async function generateIntentContent(
  page: IntentLandingRecord,
): Promise<IntentAgentOutput> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'intent_content',
          strict: true,
          schema: OUTPUT_SCHEMA,
        },
      },
      messages: [
        { role: 'system', content: buildSystemPrompt(page.locale) },
        { role: 'user', content: buildUserPrompt(page) },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error')
    throw new Error(`OpenAI API error ${response.status}: ${err}`)
  }

  const json = await response.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  const parsed: IntentAgentOutput = JSON.parse(content)
  return parsed
}

// ─── Apply agent output to a DB record ───────────────────────────────────────

export async function applyAgentOutput(
  id: string,
  output: IntentAgentOutput,
): Promise<void> {
  const { prisma } = await import('@/lib/db')
  await prisma.intentLanding.update({
    where: { id },
    data: {
      emotionalHook: output.emotionalHook,
      heroSubcopy: output.heroSubcopy,
      seoCopy: output.seoCopy,
      aiSearchQA: output.aiSearchQA as any[],
      segments: output.segments as any[],
      socialProofClusters: output.socialProofClusters as any[],
    },
  })
}
