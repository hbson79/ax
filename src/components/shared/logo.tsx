import Link from "next/link"
import { Blocks } from "lucide-react"
import { siteConfig } from "@/lib/constants"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Blocks className="h-6 w-6" />
      <span className="text-lg font-bold">{siteConfig.name}</span>
    </Link>
  )
}
