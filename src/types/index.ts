export interface NavLink {
  label: string
  href: string
}

export interface Feature {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export interface FaqItem {
  question: string
  answer: string
}

export interface PricingPlan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export interface Testimonial {
  name: string
  role: string
  company: string
  content: string
}
