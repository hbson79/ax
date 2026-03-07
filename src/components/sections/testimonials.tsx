"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"
import type { Testimonial } from "@/types"

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "CTO",
    company: "TechFlow",
    content:
      "This platform transformed how our team works. We cut our development time in half and our productivity has never been higher.",
  },
  {
    name: "Michael Park",
    role: "Head of Engineering",
    company: "ScaleUp",
    content:
      "The analytics features alone are worth it. We finally have real visibility into our operations and can make data-driven decisions.",
  },
  {
    name: "Emily Rodriguez",
    role: "Founder",
    company: "LaunchPad",
    content:
      "As a startup, we needed something that could grow with us. The free plan got us started, and upgrading to Pro was seamless.",
  },
  {
    name: "David Kim",
    role: "Product Manager",
    company: "CloudBase",
    content:
      "The integrations are incredible. We connected all our existing tools in minutes. No more switching between apps.",
  },
  {
    name: "Lisa Wang",
    role: "VP of Operations",
    company: "DataSync",
    content:
      "Enterprise-grade security with a startup-friendly UX. Our security team is happy and our developers love using it.",
  },
  {
    name: "James Wilson",
    role: "CEO",
    company: "GrowthLab",
    content:
      "We evaluated dozens of platforms. This one stood out for its simplicity, performance, and exceptional customer support.",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="Loved by Teams Everywhere"
            description="See what our customers have to say about their experience."
          />
        </AnimatedWrapper>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <AnimatedWrapper key={testimonial.name} delay={index * 0.1}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-base leading-relaxed">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {testimonial.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
