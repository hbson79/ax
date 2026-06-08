export const siteConfig = {
  name: "고장처치 AX",
  description:
    "지하철 차량 고장 데이터를 모아 AI가 고장처치 위키로 정제합니다. 관제사는 즉시 조치를 안내하고, 승무원은 평상시 학습으로 역량을 키웁니다.",
  url: "https://example.com",
  ogImage: "https://example.com/og.jpg",
} as const

export const navLinks = [
  { label: "고장 보고", href: "/report" },
  { label: "관제 검색", href: "/control" },
  { label: "학습 위키", href: "/wiki" },
] as const

export const footerLinks = {
  product: [
    { label: "고장 보고", href: "/report" },
    { label: "관제 검색", href: "/control" },
    { label: "학습 위키", href: "/wiki" },
  ],
  company: [
    { label: "소개", href: "#" },
    { label: "도움말", href: "#" },
  ],
  legal: [
    { label: "개인정보처리방침", href: "#" },
    { label: "이용약관", href: "#" },
  ],
} as const
