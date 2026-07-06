import { useEffect, useRef, useState } from "react"
import { Send, Sparkles, X } from "lucide-react"
import { useBrandAssistant } from "../useBrandAssistant"
import { ASSISTANT_DISCLAIMER, STARTER_PROMPTS } from "../constants"
import { Button } from "../../../components/ui/Button"
import { Input } from "../../../components/ui/Input"
import { cn } from "../../../lib/cn"

function AssistantMessage({ content, role }) {
  const isUser = role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-xl px-3 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-indigo-600/90 text-white"
            : "border border-zinc-800/80 bg-zinc-950/60 text-zinc-300"
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  )
}

export function BrandAssistantPanel({ open, onClose, brand }) {
  const { ask } = useBrandAssistant(brand)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hi — I'm the Max OS assistant for ${brand.brandName}. I use your live CRM data to suggest next steps. Pick a prompt below or ask a question.`,
      },
    ])
    setInput("")
  }, [open, brand.id, brand.brandName])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  function submitQuestion(question, promptId = null) {
    const trimmed = question.trim()
    if (!trimmed) return

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }
    const response = ask(trimmed, promptId)
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response.replace(/\*\*/g, ""),
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
  }

  function handleSubmit(e) {
    e.preventDefault()
    submitQuestion(input)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close assistant"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-assistant-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/50"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-zinc-800 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="shrink-0 text-indigo-400" />
              <h2 id="brand-assistant-title" className="text-base font-semibold text-zinc-100">
                Ask Max OS
              </h2>
            </div>
            <p className="mt-0.5 truncate text-sm text-zinc-500">{brand.brandName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            icon={X}
            onClick={onClose}
            aria-label="Close"
            className="shrink-0"
          />
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <AssistantMessage key={message.id} role={message.role} content={message.content} />
          ))}
        </div>

        <div className="shrink-0 border-t border-zinc-800 px-4 py-3">
          <p className="mb-2 text-[11px] text-zinc-600">{ASSISTANT_DISCLAIMER}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => submitQuestion(prompt.label, prompt.id)}
                className="rounded-full border border-zinc-800 bg-zinc-950/50 px-2.5 py-1 text-[11px] text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                {prompt.shortLabel}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this brand..."
              className="flex-1"
            />
            <Button type="submit" size="icon" icon={Send} aria-label="Send question" disabled={!input.trim()} />
          </form>
        </div>
      </div>
    </div>
  )
}
