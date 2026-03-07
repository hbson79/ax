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
