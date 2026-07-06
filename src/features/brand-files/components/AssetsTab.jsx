import { useRef, useState } from "react"
import { FileUp, Loader2, Upload } from "lucide-react"
import { useBrandFiles } from "../useBrandFiles"
import { DeleteBrandFileModal } from "./DeleteBrandFileModal"
import { AssetRow } from "./AssetRow"
import {
  ASSET_TYPES,
  DEFAULT_ASSET_TYPE,
  MAX_FILE_SIZE_BYTES,
} from "../constants"
import { formatFileSize, parseTagsInput } from "../utils"
import { Card } from "../../../components/ui/Card"
import { Button } from "../../../components/ui/Button"
import { Select } from "../../../components/ui/Select"
import { Input } from "../../../components/ui/Input"
import { EmptyState } from "../../../components/ui/EmptyState"
import { SectionHeader } from "../../today/components/SectionHeader"
import { cn } from "../../../lib/cn"
import { useToast } from "../../../components/ui/useToast"

export function AssetsTab({ brandId, brandName }) {
  const { toast } = useToast()
  const inputRef = useRef(null)
  const {
    files,
    featuredAsset,
    groupedAssets,
    loading,
    error,
    cloudReady,
    uploadFile,
    removeFile,
    openFile,
    downloadFile,
    getSignedUrl,
    saveMetadata,
    setFeatured,
  } = useBrandFiles(brandId)

  const [assetType, setAssetType] = useState(DEFAULT_ASSET_TYPE)
  const [notes, setNotes] = useState("")
  const [version, setVersion] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [deletingFile, setDeletingFile] = useState(null)

  const totalAssets = files.length

  function pickFile(file) {
    if (!file) return
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast("File exceeds 50 MB limit", "error")
      return
    }
    setSelectedFile(file)
  }

  function handleInputChange(e) {
    pickFile(e.target.files?.[0] ?? null)
    e.target.value = ""
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    pickFile(e.dataTransfer.files?.[0] ?? null)
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast("Choose a file to upload", "error")
      return
    }

    setUploading(true)
    const result = await uploadFile(selectedFile, assetType, {
      notes,
      version,
      tags: parseTagsInput(tagsInput),
    })
    setUploading(false)

    if (!result.ok) {
      toast(result.error ?? "Upload failed", "error")
      return
    }

    toast(`Uploaded ${selectedFile.name}`)
    setSelectedFile(null)
    setNotes("")
    setVersion("")
    setTagsInput("")
    setAssetType(DEFAULT_ASSET_TYPE)
  }

  async function handleOpen(file) {
    const result = await openFile(file)
    if (!result.ok) {
      toast(result.error ?? "Could not open asset", "error")
    }
  }

  async function handleDownload(file) {
    const result = await downloadFile(file)
    if (!result.ok) {
      toast(result.error ?? "Download failed", "error")
    }
  }

  async function handleDelete() {
    if (!deletingFile) return
    const result = await removeFile(deletingFile)
    if (!result.ok) {
      toast(result.error ?? "Delete failed", "error")
      return
    }
    toast(`Deleted ${deletingFile.fileName}`)
  }

  async function handleSaveNotes(file, value) {
    if (value === file.notes) return
    const result = await saveMetadata(file, { notes: value })
    if (!result.ok) {
      toast(result.error ?? "Failed to save notes", "error")
    }
  }

  async function handleSetFeatured(file) {
    const result = await setFeatured(file)
    if (!result.ok) {
      toast(result.error ?? "Could not set featured asset", "error")
      return
    }
    toast(`${file.fileName} is now featured`)
  }

  if (!cloudReady) {
    return (
      <Card padding="md">
        <EmptyState
          icon={FileUp}
          title="Brand Vault requires cloud mode"
          description="Sign in with Google and ensure Supabase is connected to upload sales sheets, catalogs, price lists, and other brand assets."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card padding="md" className="space-y-4">
        <SectionHeader title="Upload Asset" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="asset-type" className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Asset Type
                </label>
                <Select
                  id="asset-type"
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                >
                  {ASSET_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="asset-version" className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Version (optional)
                </label>
                <Input
                  id="asset-version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 2026 Q1"
                />
              </div>
              <div>
                <label htmlFor="asset-tags" className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Tags (optional)
                </label>
                <Input
                  id="asset-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="seasonal, wholesale"
                />
              </div>
              <div>
                <label htmlFor="asset-notes" className="mb-1.5 block text-xs font-medium text-zinc-500">
                  Notes (optional)
                </label>
                <Input
                  id="asset-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Account-specific, season..."
                />
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
                dragging
                  ? "border-indigo-500/60 bg-indigo-500/[0.06]"
                  : "border-zinc-800 bg-zinc-950/30 hover:border-zinc-700"
              )}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  inputRef.current?.click()
                }
              }}
              role="button"
              tabIndex={0}
            >
              <Upload size={22} className="mb-2 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-300">
                {selectedFile ? selectedFile.name : "Drag and drop an asset here"}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                PDFs, images, spreadsheets, and marketing assets · max 50 MB
              </p>
              {selectedFile && (
                <p className="mt-2 text-xs text-zinc-500">{formatFileSize(selectedFile.size)}</p>
              )}
            </div>

            <input ref={inputRef} type="file" className="hidden" onChange={handleInputChange} />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={uploading ? Loader2 : Upload}
            className={uploading ? "[&_svg]:animate-spin" : undefined}
            disabled={uploading || !selectedFile}
            onClick={handleUpload}
          >
            Upload Asset
          </Button>
        </div>
      </Card>

      {loading ? (
        <Card padding="md" className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
          <Loader2 size={16} className="animate-spin" />
          Loading assets…
        </Card>
      ) : error ? (
        <Card padding="md">
          <p className="text-sm text-red-400">{error}</p>
          <p className="mt-2 text-xs text-zinc-600">
            Run supabase/brand-files-storage.sql in your Supabase SQL Editor if this is your first
            setup.
          </p>
        </Card>
      ) : totalAssets === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={FileUp}
            title="No assets yet"
            description={`Upload sales sheets, catalogs, and price lists for ${brandName}.`}
            actionLabel="Choose Asset"
            onAction={() => inputRef.current?.click()}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {featuredAsset && (
            <Card padding="md" className="border-amber-500/20 bg-amber-500/[0.03]">
              <SectionHeader title="★ Featured Asset" />
              <AssetRow
                file={featuredAsset}
                featured
                getSignedUrl={getSignedUrl}
                onOpen={handleOpen}
                onDownload={handleDownload}
                onDelete={setDeletingFile}
                onSetFeatured={handleSetFeatured}
                onSaveNotes={handleSaveNotes}
              />
            </Card>
          )}

          {groupedAssets.map((group) => (
            <Card key={group.type} padding="md">
              <SectionHeader title={group.type} count={group.assets.length} />
              <div className="space-y-2">
                {group.assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    file={asset}
                    getSignedUrl={getSignedUrl}
                    onOpen={handleOpen}
                    onDownload={handleDownload}
                    onDelete={setDeletingFile}
                    onSetFeatured={handleSetFeatured}
                    onSaveNotes={handleSaveNotes}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <DeleteBrandFileModal
        open={Boolean(deletingFile)}
        onClose={() => setDeletingFile(null)}
        onConfirm={handleDelete}
        fileName={deletingFile?.fileName ?? ""}
      />
    </div>
  )
}
