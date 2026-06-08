"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { WikiCard } from "@/components/wiki/wiki-card"
import type { WikiDoc } from "@/types"

export default function WikiPage() {
  const [docs, setDocs] = useState<WikiDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/wiki")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setDocs(data.wiki ?? [])
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "위키를 불러오지 못했습니다."
        )
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(docs.map((d) => d.category).filter(Boolean))),
    [docs]
  )

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return docs.filter((d) => {
      if (category && d.category !== category) return false
      if (!kw) return true
      return (
        d.title.toLowerCase().includes(kw) ||
        (d.symptom_summary ?? "").toLowerCase().includes(kw) ||
        (d.cause ?? "").toLowerCase().includes(kw)
      )
    })
  }, [docs, keyword, category])

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              고장처치 학습 위키
            </h1>
            <p className="text-muted-foreground mt-2">
              AI가 정제한 고장처치 문서로 평상시 학습하고 현장 대응 역량을
              키우세요.
            </p>
          </div>

          <div className="mb-6 space-y-3">
            <Input
              placeholder="제목·증상·원인으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={category === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCategory(null)}
                >
                  전체
                </Badge>
                {categories.map((c) => (
                  <Badge
                    key={c}
                    variant={category === c ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setCategory(c!)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              불러오는 중...
            </p>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                {docs.length === 0
                  ? "아직 생성된 위키 문서가 없습니다."
                  : "조건에 맞는 문서가 없습니다."}
              </p>
              {docs.length === 0 && (
                <Button asChild variant="outline" className="mt-4">
                  <a href="/report">고장 보고 입력하러 가기</a>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((doc) => (
                <WikiCard
                  key={doc.id}
                  doc={doc}
                  showBody={keyword.trim().length > 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
