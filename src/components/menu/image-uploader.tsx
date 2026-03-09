"use client"

import { useCallback, useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { compressImage, formatFileSize } from "@/lib/image-utils"

interface ImageUploaderProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
}

interface SizeInfo {
  originalSize: number
  compressedSize: number
}

export function ImageUploader({ onFileSelect, isLoading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [sizeInfo, setSizeInfo] = useState<SizeInfo | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return

    setIsCompressing(true)
    try {
      const {
        file: compressed,
        originalSize,
        compressedSize,
      } = await compressImage(file)

      setSelectedFile(compressed)
      setSizeInfo({ originalSize, compressedSize })

      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(compressed)
    } finally {
      setIsCompressing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const clearImage = () => {
    setPreview(null)
    setSelectedFile(null)
    setSizeInfo(null)
  }

  const handleAnalyze = () => {
    if (selectedFile) onFileSelect(selectedFile)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <label
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "border-border hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
            dragOver && "border-primary bg-primary/5"
          )}
        >
          {isCompressing ? (
            <>
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-current border-t-transparent opacity-50" />
              <p className="text-foreground mb-1 text-lg font-medium">
                이미지 최적화 중...
              </p>
            </>
          ) : (
            <>
              <Upload className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-foreground mb-1 text-lg font-medium">
                메뉴 사진을 업로드하세요
              </p>
              <p className="text-muted-foreground text-sm">
                드래그 앤 드롭 또는 클릭하여 선택
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                JPG, PNG, WebP (자동 최적화됨)
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={isCompressing}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border">
            <button
              onClick={clearImage}
              className="bg-background/80 hover:bg-background absolute top-2 right-2 rounded-full p-1.5 backdrop-blur-sm transition-colors"
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={preview}
              alt="메뉴 사진 미리보기"
              className="max-h-[500px] w-full object-contain"
            />
          </div>

          {sizeInfo && sizeInfo.originalSize !== sizeInfo.compressedSize && (
            <p className="text-muted-foreground text-center text-xs">
              이미지 최적화: {formatFileSize(sizeInfo.originalSize)} →{" "}
              {formatFileSize(sizeInfo.compressedSize)} (
              {Math.round(
                (1 - sizeInfo.compressedSize / sizeInfo.originalSize) * 100
              )}
              % 절감)
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              size="lg"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  AI 분석 중...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  메뉴 분석하기
                </>
              )}
            </Button>
            <Button
              onClick={clearImage}
              variant="outline"
              size="lg"
              disabled={isLoading}
            >
              다시 선택
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
