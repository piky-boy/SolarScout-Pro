import { BotMessageSquare } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { AISearchQA } from '@/lib/intent-types'

interface IntentQABlockProps {
  qaList: AISearchQA[]
}

export function IntentQABlock({ qaList }: IntentQABlockProps) {
  if (!qaList.length) return null

  return (
    <section className="bg-muted/30 py-16">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
            <BotMessageSquare className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-amber-500">
              AI Search Answers
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Common Questions Answered
            </h2>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {qaList.map((qa, i) => (
            <AccordionItem
              key={i}
              value={`qa-${i}`}
              className="rounded-lg border border-border/60 bg-background px-4"
            >
              <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
                {qa.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0 text-muted-foreground">
                {qa.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-4 text-xs text-muted-foreground/60">
          Optimised for Google AI Overviews, ChatGPT and Perplexity.
        </p>
      </div>
    </section>
  )
}
