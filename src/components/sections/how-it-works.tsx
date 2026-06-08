"use client"

import { ClipboardList, Sparkles, Radio } from "lucide-react"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const steps = [
  {
    step: "01",
    title: "고장 데이터 수집",
    description:
      "현장 고장과 조치 내용을 직접 입력하거나 기존 보고서를 업로드해 raw 데이터로 모읍니다.",
    icon: ClipboardList,
  },
  {
    step: "02",
    title: "AI 위키 생성",
    description:
      "관제사가 유사 고장들을 선택해 생성을 누르면, AI가 증상·원인·조치 절차로 정제한 위키 문서를 만듭니다.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "검색 & 학습",
    description:
      "관제사는 증상을 검색해 즉시 조치를 안내하고, 승무원은 평상시 위키로 학습합니다.",
    icon: Radio,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="사용 방법"
            description="3단계로 고장 데이터를 실전 조치 지식으로 만드세요"
          />
        </AnimatedWrapper>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
          {steps.map((item, index) => (
            <AnimatedWrapper key={item.step} delay={index * 0.15}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary text-primary-foreground mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                  <item.icon className="h-8 w-8" />
                </div>
                <span className="text-primary mb-2 text-sm font-bold">
                  STEP {item.step}
                </span>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
