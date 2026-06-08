"use client"

import { useState } from "react"
import { Loader2, Pencil, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { RawReport } from "@/types"

interface ReportCardProps {
  report: RawReport
  checked: boolean
  onToggle: () => void
  onUpdated: (report: RawReport) => void
  onDeleted: (id: string) => void
}

export function ReportCard({
  report,
  checked,
  onToggle,
  onUpdated,
  onDeleted,
}: ReportCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [draft, setDraft] = useState(report)

  const startEdit = () => {
    setDraft(report)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setDraft(report)
  }

  const handleSave = async () => {
    if (!draft.symptom.trim()) {
      toast.error("증상은 필수 입력 항목입니다.")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line: draft.line ?? "",
          train_no: draft.train_no ?? "",
          symptom: draft.symptom,
          action: draft.action ?? "",
          result: draft.result ?? "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "수정 실패")
      toast.success("고장 보고를 수정했습니다.")
      setIsEditing(false)
      onUpdated(data.report)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "수정 실패")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("이 고장 보고를 삭제할까요?")) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "삭제 실패")
      toast.success("고장 보고를 삭제했습니다.")
      onDeleted(report.id!)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "삭제 실패")
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <Card className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">호선</Label>
            <Input
              placeholder="예: 2호선"
              value={draft.line ?? ""}
              onChange={(e) => setDraft({ ...draft, line: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">차량번호</Label>
            <Input
              placeholder="예: 2073"
              value={draft.train_no ?? ""}
              onChange={(e) => setDraft({ ...draft, train_no: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">
            증상 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            rows={2}
            value={draft.symptom}
            onChange={(e) => setDraft({ ...draft, symptom: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">조치 내용</Label>
          <Textarea
            rows={2}
            value={draft.action ?? ""}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">조치 결과</Label>
          <Input
            value={draft.result ?? ""}
            onChange={(e) => setDraft({ ...draft, result: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelEdit}
            disabled={isSaving}
          >
            <X className="mr-1 h-4 w-4" />
            취소
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="flex cursor-pointer flex-row items-start gap-3 p-4"
      onClick={() => report.id && onToggle()}
    >
      <Checkbox checked={checked} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {report.line && <Badge variant="secondary">{report.line}</Badge>}
          {report.train_no && (
            <Badge variant="outline">{report.train_no}</Badge>
          )}
          {report.source === "upload" && (
            <Badge variant="outline">업로드</Badge>
          )}
        </div>
        <p className="text-foreground text-sm font-medium">{report.symptom}</p>
        {report.action && (
          <p className="text-muted-foreground mt-0.5 text-sm">
            조치: {report.action}
          </p>
        )}
        {report.result && (
          <p className="text-muted-foreground mt-0.5 text-sm">
            결과: {report.result}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={startEdit}
          aria-label="수정"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive h-8 w-8"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="삭제"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  )
}
