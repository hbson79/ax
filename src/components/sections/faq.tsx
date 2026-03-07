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
    question: "What is included in this starter kit?",
    answer:
      "This starter kit includes Next.js with App Router, TypeScript, Tailwind CSS, Shadcn UI, dark mode support, Framer Motion animations, form handling with React Hook Form + Zod, state management with Zustand, and code quality tools like ESLint, Prettier, and Husky.",
  },
  {
    question: "Can I use this for commercial projects?",
    answer:
      "Yes! This starter kit is open source and can be used for any type of project, including commercial ones. Feel free to modify it to fit your needs.",
  },
  {
    question: "How do I add authentication?",
    answer:
      "We recommend using Supabase for authentication. Install @supabase/supabase-js and @supabase/ssr, then follow the Supabase Next.js guide to set up auth with social login, email/password, and more.",
  },
  {
    question: "Is this optimized for SEO?",
    answer:
      "Yes. Next.js App Router provides built-in SEO support with the Metadata API. The starter kit includes basic metadata configuration that you can customize for your project.",
  },
  {
    question: "How do I deploy this?",
    answer:
      "The easiest way is to deploy on Vercel, which is optimized for Next.js. Simply connect your Git repository and Vercel will handle the rest automatically.",
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
