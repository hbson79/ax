"use client"

import { Upload, Brain, Download } from "lucide-react"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const steps = [
  {
    step: "01",
    title: "사진 업로드",
    description:
      "구내식당 메뉴표 사진을 드래그앤드롭 또는 클릭으로 업로드합니다.",
    icon: Upload,
  },
  {
    step: "02",
    title: "AI 자동 분석",
    description:
      "AI가 사진 속 텍스트를 인식하고 날짜, 끼니, 메뉴를 자동으로 분류합니다.\n단,AI는 실수를 할 수 있으니 결과를 꼭 확인해주세요.",
    icon: Brain,
  },
  {
    step: "03",
    title: "결과 확인",
    description:
      "깔끔한 사진파일로 다운로드 또는 교번달력앱 or 내근무앱에서 쉽게 확인할 수 있습니다.",
    icon: Download,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="사용 방법"
            description="3단계로 간단하게 메뉴를 데이터로 변환하세요"
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
