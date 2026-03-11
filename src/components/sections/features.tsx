"use client"

import {
  Camera,
  Zap,
  FileJson,
  Calendar,
  Shield,
  Smartphone,
} from "lucide-react"
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
    title: "사진만 찍으면 끝",
    description:
      "구내식당 메뉴판을 사진으로 찍기만 하면 AI가 알아서 텍스트를 인식하고 분류합니다.",
    icon: Camera,
  },
  {
    title: "빠른 분석",
    description: "최신 AI 비전 기술로 몇 초 만에 전체 주간 식단을 분석합니다.",
    icon: Zap,
  },
  {
    title: "구조화된 데이터",
    description:
      "분석 결과를 깔끔한 테이블형 사진으로 다운로드가능하며 교번달력앱에서 확인가능합니다.",
    icon: FileJson,
  },
  {
    title: "주간 식단표 지원",
    description:
      "주간 메뉴표를 날짜별, 끼니별(조식/중식/석식)로 자동 분류합니다.",
    icon: Calendar,
  },
  {
    title: "정확한 인식",
    description:
      "손글씨, 인쇄물, 디지털 화면 등 다양한 형태의 메뉴판을 높은 정확도로 인식합니다.",
    icon: Shield,
  },
  {
    title: "어디서든 사용",
    description:
      "PC, 태블릿, 스마트폰 등 어떤 기기에서든 웹브라우저로 바로 사용할 수 있습니다.",
    icon: Smartphone,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="주요 기능"
            description="AI 기반 메뉴 분석으로 구내식당 식단 관리를 스마트하게"
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
