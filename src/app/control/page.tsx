"use client"

import { useState } from "react"
import { Loader2, Search, Radio } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { WikiCard } from "@/components/wiki/wiki-card"
import type { SearchResult } from "@/types"

export default function ControlPage() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("고장 증상을 입력해주세요.")
      return
    }
    setIsSearching(true)
    setResult(null)
    try {
      const res = await fetch("/api/wiki/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "검색 실패")
      setResult(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "검색 실패")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              관제 고장 검색
            </h1>
            <p className="text-muted-foreground mt-2">
              현장 증상을 입력하면 그동안 쌓인 데이터를 근거로 즉시 조치를
              안내합니다.
            </p>
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="예: 2호선 운행 중 출입문이 닫히지 않고 추진 불능 상태입니다"
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSearch()
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              size="lg"
              className="w-full"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  검색 중...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  조치 안내 검색 (⌘+Enter)
                </>
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-8 space-y-6">
              {/* AI 즉시 조치 안내 */}
              <Card className="border-primary/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-primary flex items-center gap-2 text-lg">
                    <Radio className="h-5 w-5" />
                    즉시 조치 안내
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground text-sm whitespace-pre-wrap">
                    {result.guidance}
                  </p>
                </CardContent>
              </Card>

              {/* 근거 위키 문서 */}
              {result.matches.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-muted-foreground text-sm font-semibold">
                    근거 문서 ({result.matches.length})
                  </h2>
                  {result.matches.map((doc) => (
                    <WikiCard key={doc.id} doc={doc} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
