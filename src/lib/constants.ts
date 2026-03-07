export const siteConfig = {
  name: "Starter Kit",
  description:
    "A modern web starter kit built with Next.js, Tailwind CSS, and Shadcn UI.",
  url: "https://example.com",
  ogImage: "https://example.com/og.jpg",
} as const

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#cta" },
] as const

export const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
} as const
