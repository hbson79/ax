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
    question: "어떤 형태의 메뉴판도 인식되나요?",
    answer:
      "인쇄된 메뉴판, 화이트보드에 적힌 메뉴, 디지털 화면 캡처 등 대부분의 형태를 인식할 수 있습니다. 다만, 글씨가 너무 작거나 흐린 경우 인식률이 떨어질 수 있으니 가능한 선명한 사진을 촬영해주세요.",
  },
  {
    question: "분석 결과는 어떤 형식으로 제공되나요?",
    answer:
      "테이블 형태의 시각적 뷰와 구조화된 JSON 데이터 두 가지 형식으로 제공됩니다. JSON 데이터는 클립보드에 복사하여 다른 시스템과 연동할 수 있습니다.",
  },
  {
    question: "비용이 발생하나요?",
    answer:
      "현재는 무료로 제공됩니다. 분석 횟수에 제한이 있을 수 있으며, 추후 대량 사용을 위한 유료 플랜이 추가될 수 있습니다.",
  },
  {
    question: "업로드한 사진은 저장되나요?",
    answer:
      "아닙니다. 업로드한 사진은 AI 분석에만 사용되며, 분석이 완료된 후 즉시 삭제됩니다. 어떤 이미지도 서버에 영구 저장되지 않습니다.",
  },
  {
    question: "외국어 메뉴판도 지원하나요?",
    answer:
      "현재는 한국어 메뉴판에 최적화되어 있습니다. 영어, 일본어 등 다른 언어도 기본적인 인식은 가능하지만, 한국어 대비 정확도가 다소 낮을 수 있습니다.",
  },
  {
    question: "모바일에서도 사용할 수 있나요?",
    answer:
      "네, 반응형 웹으로 제작되어 스마트폰, 태블릿 등 모든 기기에서 사용할 수 있습니다. 모바일 카메라로 촬영한 사진을 바로 업로드하면 됩니다.",
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
