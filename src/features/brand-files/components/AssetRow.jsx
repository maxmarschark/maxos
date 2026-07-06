import { Download, ExternalLink, Star, Trash2 } from "lucide-react"
import { AssetThumbnail } from "./AssetThumbnail"
import { Button } from "../../../components/ui/Button"
import { Badge } from "../../../components/ui/Badge"
import { Textarea } from "../../../components/ui/Textarea"
import { formatDate } from "../../../lib/format"
import { formatFileSize, formatTagsList, normalizeAssetType } from "../utils"
import { cn } from "../../../lib/cn"

export function AssetRow({
  file,
  getSignedUrl,
  onOpen,
  onDownload,
  onDelete,
  onSetFeatured,
  onSaveNotes,
  featured = false,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-3 sm:flex-row sm:items-center",
        featured && "border-amber-500/30 bg-amber-500/[0.04]"
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <AssetThumbnail file={file} getSignedUrl={getSignedUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-zinc-200">{file.fileName}</p>
            {featured && (
              <Badge variant="warning" className="normal-case tracking-normal">
                ★ Featured
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <Badge variant="default" className="normal-case tracking-normal">
              {normalizeAssetType(file.category)}
            </Badge>
            <span>{formatDate(file.uploadedAt)}</span>
            <span>·</span>
            <span>{formatFileSize(file.fileSize)}</span>
            {file.version && (
              <>
                <span>·</span>
                <span>v{file.version}</span>
              </>
            )}
          </div>
          {file.tags?.length > 0 && (
            <p className="mt-1 text-xs text-zinc-600">{formatTagsList(file.tags)}</p>
          )}
          <Textarea
            defaultValue={file.notes}
            placeholder="Add notes..."
            className="mt-2 min-h-[32px] text-xs"
            onBlur={(e) => onSaveNotes(file, e.target.value)}
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:ml-auto">
        {!featured && (
          <Button
            variant="ghost"
            size="sm"
            icon={Star}
            aria-label="Set as featured asset"
            onClick={() => onSetFeatured(file)}
          >
            Feature
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={ExternalLink}
          aria-label="Open asset"
          onClick={() => onOpen(file)}
        >
          Open
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={Download}
          aria-label="Download asset"
          onClick={() => onDownload(file)}
        >
          Download
        </Button>
        <Button
          variant="ghost"
          size="icon"
          icon={Trash2}
          aria-label="Delete asset"
          className="hover:text-red-400"
          onClick={() => onDelete(file)}
        />
      </div>
    </div>
  )
}
