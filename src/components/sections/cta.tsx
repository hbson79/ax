"use client"

import Link from "next/link"
import { ArrowRight, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

export function CTA() {
  return (
    <section id="cta" className="bg-muted/40 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <div className="bg-primary text-primary-foreground rounded-3xl px-6 py-16 text-center md:px-16 md:py-24">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              지금 바로 메뉴를 분석해보세요
            </h2>
            <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl text-lg">
              사진 한 장이면 충분합니다. 구내식당 메뉴표를 스마트한 데이터로
              변환해보세요.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/analyze">
                  <Camera className="mr-2 h-4 w-4" />
                  메뉴 분석하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  )
}
