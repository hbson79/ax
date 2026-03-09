const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85
const SKIP_THRESHOLD = 1 * 1024 * 1024 // 1MB 미만이면 압축 스킵

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      },
      type,
      quality
    )
  })
}

export async function compressImage(
  file: File
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size

  // 이미 작은 이미지는 그대로 반환
  if (originalSize < SKIP_THRESHOLD) {
    return { file, originalSize, compressedSize: originalSize }
  }

  const img = await loadImage(file)

  let { width, height } = img
  const maxSide = Math.max(width, height)

  // 리사이즈 필요 여부 확인
  if (maxSide > MAX_DIMENSION) {
    const ratio = MAX_DIMENSION / maxSide
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Canvas에 그리기
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d")!
  // 텍스트 선명도를 위해 고품질 렌더링
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(img, 0, 0, width, height)

  // ObjectURL 정리
  URL.revokeObjectURL(img.src)

  // JPEG로 압축
  const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY)
  const compressedFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  })

  return {
    file: compressedFile,
    originalSize,
    compressedSize: compressedFile.size,
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
