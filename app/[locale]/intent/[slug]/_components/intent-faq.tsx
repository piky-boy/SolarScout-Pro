import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { IntentFAQ } from '@/lib/intent-types'

interface IntentFAQProps {
  faqs: IntentFAQ[]
}

export function IntentFAQ({ faqs }: IntentFAQProps) {
  if (!faqs.length) return null

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              FAQ
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border border-border/60 px-4"
            >
              <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
