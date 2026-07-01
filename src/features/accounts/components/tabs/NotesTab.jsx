import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Card } from "../../../../components/ui/Card"
import { Button } from "../../../../components/ui/Button"
import { Textarea } from "../../../../components/ui/Textarea"
import { EmptyState } from "../../../../components/ui/EmptyState"
import { formatDate } from "../../../../lib/format"

export function NotesTab({ account, onAddNote, onDeleteNote }) {
  const [content, setContent] = useState("")

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onAddNote(trimmed)
    setContent("")
  }

  return (
    <div className="space-y-4">
      <Card padding="md">
        <form onSubmit={handleAdd} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note about this account..."
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!content.trim()}>
              Add Note
            </Button>
          </div>
        </form>
      </Card>

      {account.notes.length === 0 ? (
        <Card padding="none">
          <EmptyState
            title="No notes yet"
            description="Add notes to track conversations, preferences, and important details."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {account.notes.map((note) => (
            <Card key={note.id} padding="md" className="group">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-zinc-300">{note.content}</p>
                  <p className="mt-2 text-xs text-zinc-600">
                    {formatDate(note.createdAt)}
                  </p>
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
      )}
    </div>
  )
}
