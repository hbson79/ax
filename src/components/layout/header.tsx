"use client"

import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { useScrollTop } from "@/hooks/use-scroll-top"
import { navLinks } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Header() {
  const scrolled = useScrollTop()

  return (
    <header
      className={cn(
        "bg-background/80 sticky top-0 z-50 w-full backdrop-blur-md transition-shadow",
        scrolled && "border-border border-b shadow-sm"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex">
            <Link href="/analyze">메뉴 분석하기</Link>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
