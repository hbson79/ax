"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionHeader } from "@/components/shared/section-header"
import { AnimatedWrapper } from "@/components/shared/animated-wrapper"

const faqs = [
  {
    question: "고장 데이터는 어떻게 입력하나요?",
    answer:
      "두 가지 방법이 있습니다. '고장 보고' 페이지에서 호선·차량번호·증상·조치를 직접 입력하거나, 개인 PC에 흩어진 기존 고장 보고서(이미지·PDF·텍스트)를 업로드하면 AI가 구조화된 데이터로 추출해 저장합니다.",
  },
  {
    question: "위키 문서는 자동으로 만들어지나요?",
    answer:
      "수동 트리거 방식입니다. 관제사가 유사한 고장 보고들을 선택한 뒤 'wiki 생성' 버튼을 누르면 AI가 해당 고장 유형의 정제 문서를 만듭니다. 품질과 비용을 통제하기 위한 설계입니다.",
  },
  {
    question: "관제사는 어떻게 고장을 검색하나요?",
    answer:
      "'관제 검색' 페이지에서 현장 증상을 자연어로 입력하면, AI가 의미 기반(임베딩)으로 가장 유사한 고장처치 문서를 찾아 즉시 무전으로 안내할 수 있는 단계별 조치를 생성합니다.",
  },
  {
    question: "기존 데이터가 없어도 동작하나요?",
    answer:
      "검색은 위키 문서가 있어야 동작합니다. 먼저 고장 보고를 모으고 위키를 생성하면, 데이터가 쌓일수록 검색 정확도와 조치 안내 품질이 함께 올라갑니다.",
  },
  {
    question: "한글(hwp) 문서도 업로드되나요?",
    answer:
      "현재 MVP에서는 이미지, PDF, 일반 텍스트 파일을 지원합니다. 한글(.hwp) 파일 직접 파싱은 후속 과제이며, 우선 PDF로 변환해 업로드하시면 됩니다.",
  },
  {
    question: "보안과 접근 제어는 어떻게 되나요?",
    answer:
      "현재는 프로토타입 단계로 별도 로그인 없이 사용합니다. 실제 운영 전에는 Supabase 인증과 역할 기반 접근 제어(RLS)를 적용해 관제사·승무원 권한을 분리할 예정입니다.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <AnimatedWrapper>
          <SectionHeader
            title="자주 묻는 질문"
            description="궁금한 점이 있으신가요?"
          />
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.2}>
          <div className="mx-auto mt-16 max-w-2xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  )
}
