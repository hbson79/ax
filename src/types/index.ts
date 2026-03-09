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

export interface Meal {
  breakfast?: string[]
  lunch?: string[]
  dinner?: string[]
}

export interface DailyMenu {
  date: string
  day_of_week: string
  meals: Meal
}

export interface CafeteriaMenuResult {
  cafeteria_name: string
  start_date: string
  end_date: string
  weekly_menus: DailyMenu[]
}
