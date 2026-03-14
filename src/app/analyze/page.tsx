"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ImageUploader } from "@/components/menu/image-uploader"
import { MenuResult } from "@/components/menu/menu-result"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import type { CafeteriaMenuResult } from "@/types"

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CafeteriaMenuResult | null>(null)
  const [isCached, setIsCached] = useState(false)

  const handleAnalyze = async (file: File) => {
    setIsLoading(true)
    setResult(null)
    setIsCached(false)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "분석에 실패했습니다.")
      }

      setResult(data.result)
      setIsCached(data.cached ?? false)
      toast.success(
        data.cached
          ? "이전에 분석된 결과를 불러왔습니다!"
          : "메뉴 분석이 완료되었습니다!"
      )
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "분석 중 오류가 발생했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* 간단한 헤더 */}
      <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              메뉴 사진 분석
            </h1>
            <p className="text-muted-foreground mt-2">
              메뉴표 사진을 업로드하면 AI가 자동으로 분석합니다.
              <br />
              지점이름이 나오게 그리고 선명한 사진이 분석에 유리.
            </p>
          </div>

          <ImageUploader onFileSelect={handleAnalyze} isLoading={isLoading} />

          {result && (
            <div className="mt-8">
              {isCached && (
                <div className="bg-muted mb-4 rounded-lg px-4 py-3 text-center text-sm">
                  이전에 분석된 결과입니다. 동일한 메뉴가 이미 등록되어 있어 API
                  호출 없이 불러왔습니다.
                </div>
              )}
              <MenuResult
                data={result}
                onNameChange={(newName) =>
                  setResult((prev) =>
                    prev ? { ...prev, cafeteria_name: newName } : null
                  )
                }
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
