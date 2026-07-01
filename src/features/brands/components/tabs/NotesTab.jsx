import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/Button"
import { Textarea } from "../../../../components/ui/Textarea"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { formatDate } from "../../../../lib/format"

export function NotesTab({ brand, onAddNote, onDeleteNote }) {
  const [content, setContent] = useState("")

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onAddNote(trimmed)
    setContent("")
  }

  const hasInternalNotes = Boolean(brand.notes)
  const hasEntries = brand.noteEntries.length > 0

  return (
    <div className="space-y-4">
      {brand.notes && (
        <Card padding="md" className="border-indigo-500/15 bg-indigo-500/[0.03]">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Internal Notes
          </h4>
          <p className="text-sm leading-relaxed text-zinc-300">{brand.notes}</p>
        </Card>
      )}

      <Card padding="md">
        <form onSubmit={handleAdd} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note about this brand..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!content.trim()}>
              Add Note
            </Button>
          </div>
        </form>
      </Card>

      {brand.noteEntries.length === 0 && !hasInternalNotes ? (
        <Card padding="none">
          <EmptyState
            title="No notes yet"
            description="Add notes to track conversations and partnership details."
          />
        </Card>
      ) : hasEntries ? (
        <div className="space-y-2">
          {brand.noteEntries.map((note) => (
            <Card key={note.id} padding="md" className="group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-zinc-300">{note.content}</p>
                  <p className="mt-2 text-xs text-zinc-600">{formatDate(note.createdAt)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  icon={Trash2}
                  aria-label="Delete note"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                  onClick={() => onDeleteNote(note.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
