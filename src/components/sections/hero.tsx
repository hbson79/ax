"use client"

import Link from "next/link"
import { ArrowRight, Camera } from "lucide-react"
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
              AI 기반 메뉴 자동 인식
            </Badge>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              구내식당 메뉴를{" "}
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                사진 한 장으로
              </span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg md:text-xl">
              메뉴표 사진을 찍으면 AI가 자동으로 분석하여 깔끔한 주간 식단
              데이터로 변환해드립니다.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/analyze">
                  <Camera className="mr-2 h-4 w-4" />
                  메뉴 분석하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">사용 방법 보기</Link>
              </Button>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  )
}
