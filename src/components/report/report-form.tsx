"use client"

import { useCallback, useState } from "react"
import { Loader2, Send, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ReportFormProps {
  onSaved?: () => void
}

const emptyForm = {
  line: "",
  train_no: "",
  symptom: "",
  action: "",
  result: "",
  occurred_at: "",
}

export function ReportForm({ onSaved }: ReportFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleTextSubmit = async () => {
    if (!form.symptom.trim()) {
      toast.error("증상은 필수 입력 항목입니다.")
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          occurred_at: form.occurred_at || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "저장에 실패했습니다.")
      toast.success("고장 보고가 저장되었습니다.")
      setForm(emptyForm)
      onSaved?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장 실패")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/reports", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "업로드에 실패했습니다.")
        toast.success(`${data.count}건의 고장 보고를 추출해 저장했습니다.`)
        onSaved?.()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "업로드 실패")
      } finally {
        setIsUploading(false)
      }
    },
    [onSaved]
  )

  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="text">
          <Send className="mr-1.5 h-4 w-4" />
          직접 입력
        </TabsTrigger>
        <TabsTrigger value="upload">
          <Upload className="mr-1.5 h-4 w-4" />
          문서 업로드
        </TabsTrigger>
      </TabsList>

      {/* 직접 입력 */}
      <TabsContent value="text" className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="line">호선</Label>
            <Input
              id="line"
              placeholder="예: 2호선"
              value={form.line}
              onChange={(e) => update("line", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="train_no">차량번호</Label>
            <Input
              id="train_no"
              placeholder="예: 2073"
              value={form.train_no}
              onChange={(e) => update("train_no", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="symptom">
            증상 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="symptom"
            placeholder="예: 출입문이 닫히지 않고 재동 불능 표시등 점등"
            rows={3}
            value={form.symptom}
            onChange={(e) => update("symptom", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="action">조치 내용</Label>
          <Textarea
            id="action"
            placeholder="예: 해당 출입문 차단 스위치 취급 후 재기동"
            rows={3}
            value={form.action}
            onChange={(e) => update("action", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="result">조치 결과</Label>
            <Input
              id="result"
              placeholder="예: 정상 복귀 후 운행 재개"
              value={form.result}
              onChange={(e) => update("result", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="occurred_at">발생 시각</Label>
            <Input
              id="occurred_at"
              type="datetime-local"
              value={form.occurred_at}
              onChange={(e) => update("occurred_at", e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleTextSubmit}
          disabled={isSaving}
          size="lg"
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              고장 보고 저장
            </>
          )}
        </Button>
      </TabsContent>

      {/* 문서 업로드 */}
      <TabsContent value="upload" className="mt-6">
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleUpload(file)
          }}
          className={cn(
            "border-border hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
            dragOver && "border-primary bg-primary/5",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
              <p className="text-foreground text-lg font-medium">
                AI가 문서를 분석 중...
              </p>
            </>
          ) : (
            <>
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-foreground mb-1 text-lg font-medium">
                기존 고장 보고서를 업로드하세요
              </p>
              <p className="text-muted-foreground text-sm">
                드래그 앤 드롭 또는 클릭하여 선택
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                이미지(JPG, PNG), PDF, 텍스트 파일 지원
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*,application/pdf,text/plain,.txt,.csv,.md"
            className="hidden"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />
        </label>
      </TabsContent>
    </Tabs>
  )
}
