"use client"

import { Palette, Zap, Shield, Smartphone, Code2, Layers } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const features = [
  {
    title: "Modern Stack",
    description:
      "Built with Next.js App Router, TypeScript, and Tailwind CSS for the best developer experience.",
    icon: Code2,
  },
  {
    title: "Beautiful UI",
    description:
      "Pre-configured Shadcn UI components that are accessible, customizable, and production-ready.",
    icon: Palette,
  },
  {
    title: "Dark Mode",
    description:
      "Seamless light/dark theme switching with next-themes. No flash of unstyled content.",
    icon: Zap,
  },
  {
    title: "Fully Responsive",
    description:
      "Mobile-first design that looks great on every screen size, from phones to ultrawide monitors.",
    icon: Smartphone,
  },
  {
    title: "Type Safe",
    description:
      "End-to-end type safety with TypeScript and Zod schema validation for reliable applications.",
    icon: Shield,
  },
  {
    title: "Scalable Architecture",
    description:
      "Clean project structure with organized components, hooks, stores, and utilities.",
    icon: Layers,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="Everything You Need"
            description="A comprehensive starter kit with all the essentials to build modern web applications quickly and efficiently."
          />
        </AnimatedWrapper>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <AnimatedWrapper key={feature.title} delay={index * 0.1}>
              <Card className="group hover:border-primary/20 h-full transition-colors">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
