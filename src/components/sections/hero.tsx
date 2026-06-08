"use client"

import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
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
              AI 기반 고장처치 지식 시스템
            </Badge>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              흩어진 고장 데이터를{" "}
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
                실시간 조치 지식으로
              </span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg md:text-xl">
              문서와 흩어진 암묵지를 한곳에 모으고, AI가 고장처치 위키로
              정제합니다. 관제사는 즉시 조치를, 승무원은 평상시 학습을.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.3}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/control">
                  <Search className="mr-2 h-4 w-4" />
                  고장 증상 검색하기
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
