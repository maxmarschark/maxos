import { useEffect, useState } from "react"
import { File, FileText, Film } from "lucide-react"
import { cn } from "../../../lib/cn"
import { isImageFile, isPdfFile, isVideoFile } from "../utils"

export function AssetThumbnail({ file, getSignedUrl, className }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const showImagePreview = isImageFile(file.fileType, file.fileName)

  useEffect(() => {
    if (!showImagePreview) {
      setPreviewUrl(null)
      return
    }

    let cancelled = false
    void getSignedUrl(file.filePath).then((result) => {
      if (!cancelled && result.ok) {
        setPreviewUrl(result.url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [file.filePath, getSignedUrl, showImagePreview])

  if (showImagePreview && previewUrl) {
    return (
      <img
        src={previewUrl}
        alt=""
        className={cn("h-10 w-10 shrink-0 rounded-md border border-zinc-800 object-cover", className)}
      />
    )
  }

  const Icon = isPdfFile(file.fileType, file.fileName)
    ? FileText
    : isVideoFile(file.fileType, file.fileName)
      ? Film
      : File

  const iconColor = isPdfFile(file.fileType, file.fileName)
    ? "text-red-400"
    : isVideoFile(file.fileType, file.fileName)
      ? "text-indigo-400"
      : "text-zinc-500"

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950/60",
        className
      )}
    >
      <Icon size={18} className={iconColor} strokeWidth={1.75} />
    </div>
  )
}
