"use client"

import {
  Database,
  Sparkles,
  Search,
  GraduationCap,
  Radio,
  FileUp,
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
    title: "흩어진 데이터 통합",
    description:
      "개인 PC와 문서로만 존재하던 고장·처치 내용을 한 곳에 모아 디지털 자산으로 축적합니다.",
    icon: Database,
  },
  {
    title: "AI 위키 정제",
    description:
      "쌓인 raw 고장 보고를 AI가 증상·원인·조치 절차로 정제해 신뢰할 수 있는 표준 문서로 만듭니다.",
    icon: Sparkles,
  },
  {
    title: "의미 기반 검색",
    description:
      "관제사가 증상을 자연어로 입력하면 임베딩 기반으로 가장 유사한 고장처치 문서를 즉시 찾아냅니다.",
    icon: Search,
  },
  {
    title: "즉시 조치 안내",
    description:
      "검색된 사례를 근거로 무전으로 바로 읽어줄 수 있는 단계별 조치 안내를 AI가 생성합니다.",
    icon: Radio,
  },
  {
    title: "문서 업로드 파싱",
    description:
      "기존 한글·PDF·이미지 고장 보고서를 업로드하면 AI가 구조화된 데이터로 추출해 적재합니다.",
    icon: FileUp,
  },
  {
    title: "평상시 학습",
    description:
      "승무원은 정제된 위키 문서로 평소 교육·학습을 진행해 현장 대응 역량을 키웁니다.",
    icon: GraduationCap,
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="주요 기능"
            description="흩어진 문서와 암묵지를 모아 AI가 실시간 조치 지식으로 바꿉니다"
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
