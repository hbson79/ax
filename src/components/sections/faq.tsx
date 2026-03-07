"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "You get full access to all Pro features for 14 days. No credit card required. At the end of the trial, you can choose to subscribe or continue with the free plan.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use end-to-end encryption, are SOC 2 compliant, and regularly undergo third-party security audits. Your data is stored in secure, redundant data centers.",
  },
  {
    question: "Do you offer custom enterprise plans?",
    answer:
      "Yes! Our Enterprise plan is fully customizable. Contact our sales team to discuss your specific needs, including custom SLAs, dedicated support, and on-premise deployment options.",
  },
  {
    question: "What integrations do you support?",
    answer:
      "We integrate with 100+ tools including Slack, GitHub, Jira, Notion, Google Workspace, and more. We also offer a REST API and webhooks for custom integrations.",
  },
  {
    question: "How do I get support?",
    answer:
      "Free plan users get community support. Pro users get priority email support with 24-hour response times. Enterprise users get a dedicated account manager and phone support.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-muted/40 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="Frequently Asked Questions"
            description="Got questions? We've got answers."
          />
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.2}>
          <div className="mx-auto mt-16 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  )
}
