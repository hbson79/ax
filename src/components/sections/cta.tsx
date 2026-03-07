"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

export function CTA() {
  return (
    <section id="cta" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-16 text-center md:px-16 md:py-24">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl text-lg">
              Clone this starter kit and start building your next project in
              minutes, not days.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="#">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                asChild
              >
                <Link href="#">View on GitHub</Link>
              </Button>
            </div>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  )
}
