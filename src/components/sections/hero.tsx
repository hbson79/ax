"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="from-muted/50 absolute inset-0 -z-10 bg-gradient-to-b to-transparent" />
      <div className="container mx-auto px-4 py-24 md:px-6 md:py-32 lg:py-40">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <AnimatedWrapper>
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
              Modern Web Starter Kit
            </Badge>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Build Beautiful Websites{" "}
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                Faster Than Ever
              </span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg md:text-xl">
              A production-ready starter kit with Next.js, Tailwind CSS, and
              Shadcn UI. Stop reinventing the wheel and focus on what matters.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="#cta">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  )
}
