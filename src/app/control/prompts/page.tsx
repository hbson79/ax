"use client"

import { useEffect, useState } from "react"
import { Loader2, Plus, Check, Trash2, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import type { GuidancePrompt } from "@/types"

export default function GuidancePromptsPage() {
  const [prompts, setPrompts] = useState<GuidancePrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  // 신규 생성 폼
  const [newName, setNewName] = useState("")
  const [newContent, setNewContent] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // 인라인 편집
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/guidance-prompts")
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setPrompts(data.prompts ?? [])
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "프롬프트를 불러오지 못했습니다."
        )
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim() || !newContent.trim()) {
      toast.error("이름과 프롬프트 내용을 모두 입력해주세요.")
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch("/api/guidance-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          content: newContent.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts((prev) => [data.prompt, ...prev])
      setNewName("")
      setNewContent("")
      toast.success("프롬프트를 추가했습니다.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "생성 실패")
    } finally {
      setIsCreating(false)
    }
  }

  const handleActivate = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/guidance-prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts((prev) => prev.map((p) => ({ ...p, is_active: p.id === id })))
      toast.success("이 프롬프트를 적용했습니다.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "적용 실패")
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (p: GuidancePrompt) => {
    setEditId(p.id)
    setEditName(p.name)
    setEditContent(p.content)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editContent.trim()) {
      toast.error("이름과 내용을 모두 입력해주세요.")
      return
    }
    setBusyId(id)
    try {
      const res = await fetch(`/api/guidance-prompts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          content: editContent.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts((prev) => prev.map((p) => (p.id === id ? data.prompt : p)))
      setEditId(null)
      toast.success("프롬프트를 수정했습니다.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수정 실패")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 프롬프트를 삭제할까요?")) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/guidance-prompts/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      toast.success("삭제했습니다.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제 실패")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-12 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              조치 안내 프롬프트 관리
            </h1>
            <p className="text-muted-foreground mt-2">
              AI가 즉시 조치 안내를 작성할 때 사용하는 프롬프트를 직접
              추가·수정하고, 적용할 프롬프트를 선택하세요.
            </p>
          </div>

          {/* 신규 생성 */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">새 프롬프트 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="프롬프트 이름 (예: 간결 무전형, 상세 절차형)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Textarea
                placeholder="시스템 프롬프트 내용을 입력하세요."
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                추가
              </Button>
            </CardContent>
          </Card>

          {/* 목록 */}
          {isLoading ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              불러오는 중...
            </p>
          ) : prompts.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              등록된 프롬프트가 없습니다. 위에서 추가해주세요.
            </p>
          ) : (
            <div className="space-y-4">
              {prompts.map((p) => {
                const isEditing = editId === p.id
                const busy = busyId === p.id
                return (
                  <Card
                    key={p.id}
                    className={p.is_active ? "border-primary/50" : undefined}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="max-w-xs"
                          />
                        ) : (
                          <CardTitle className="flex items-center gap-2 text-base">
                            {p.name}
                            {p.is_active && (
                              <Badge className="gap-1">
                                <Check className="h-3 w-3" />
                                적용 중
                              </Badge>
                            )}
                          </CardTitle>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isEditing ? (
                        <Textarea
                          rows={8}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                      ) : (
                        <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                          {p.content}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(p.id)}
                              disabled={busy}
                            >
                              {busy ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-1 h-4 w-4" />
                              )}
                              저장
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditId(null)}
                              disabled={busy}
                            >
                              <X className="mr-1 h-4 w-4" />
                              취소
                            </Button>
                          </>
                        ) : (
                          <>
                            {!p.is_active && (
                              <Button
                                size="sm"
                                onClick={() => handleActivate(p.id)}
                                disabled={busy}
                              >
                                {busy ? (
                                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="mr-1 h-4 w-4" />
                                )}
                                이 프롬프트 적용
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(p)}
                              disabled={busy}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(p.id)}
                              disabled={busy || p.is_active}
                              title={
                                p.is_active
                                  ? "활성 프롬프트는 삭제할 수 없습니다."
                                  : undefined
                              }
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              삭제
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
