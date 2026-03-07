import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { Features } from "@/components/sections/features"
import { CTA } from "@/components/sections/cta"
import { FAQ } from "@/components/sections/faq"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
