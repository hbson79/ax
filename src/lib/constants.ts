export const siteConfig = {
  name: "메뉴스캔",
  description:
    "구내식당 메뉴 사진을 찍으면 AI가 자동으로 분석하여 주간 식단표를 데이터로 변환해드립니다.",
  url: "https://menuscan.kr",
  ogImage: "https://menuscan.kr/og.jpg",
} as const

export const navLinks = [
  { label: "기능 소개", href: "#features" },
  { label: "사용 방법", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
] as const

export const footerLinks = {
  product: [
    { label: "기능 소개", href: "#features" },
    { label: "사용 방법", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "소개", href: "#" },
    { label: "블로그", href: "#" },
  ],
  legal: [
    { label: "개인정보처리방침", href: "#" },
    { label: "이용약관", href: "#" },
  ],
} as const
