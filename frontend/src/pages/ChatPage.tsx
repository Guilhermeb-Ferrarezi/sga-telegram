import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PaperPlaneTilt, Trash, ArrowLeft, CircleNotch, Wrench } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { ProjectStatusSchema, UserSchema, SSEEventSchema, HistoryResponseSchema } from '@/schemas'
import type { Message } from '@/schemas'
import Navbar from '@/components/Navbar'
import ChatMessage from '@/components/ChatMessage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ChatPage() {
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => UserSchema.parse((await api.get('/api/auth/me')).data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: project } = useQuery({
    queryKey: ['project'],
    queryFn: async () => ProjectStatusSchema.parse((await api.get('/api/project')).data),
    staleTime: Infinity,
  })

  useQuery({
    queryKey: ['chat', 'history'],
    queryFn: async () => {
      const data = HistoryResponseSchema.parse((await api.get('/api/chat/history')).data)
      if (!historyLoaded) {
        setMessages(data)
        setHistoryLoaded(true)
      }
      return data
    },
    staleTime: Infinity,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/api/chat/history'),
    onSuccess: () => {
      setMessages([])
      setHistoryLoaded(false)
    },
  })

  async function sendMessage() {
    const prompt = input.trim()
    if (!prompt || streaming) return

    setInput('')
    setStreaming(true)
    setStatus(null)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: prompt }
    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', streaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok || !res.body) throw new Error('Falha na requisição')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = SSEEventSchema.parse(JSON.parse(line.slice(6)))

            if (event.type === 'chunk') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.text, streaming: true }
                    : m,
                ),
              )
            } else if (event.type === 'status') {
              setStatus(event.text)
            } else if (event.type === 'done') {
              setStatus(null)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: event.text || m.content, streaming: false }
                    : m,
                ),
              )
            } else if (event.type === 'error') {
              setStatus(null)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: `Erro: ${event.text}`, streaming: false }
                    : m,
                ),
              )
            }
          } catch {
            // ignore individual line parse errors
          }
        }
      }
    } catch {
      setStatus(null)
      setMessages((prev) =>
        prev.map((m) =>
          m.streaming ? { ...m, content: 'Erro ao conectar com o servidor', streaming: false } : m,
        ),
      )
    } finally {
      setStatus(null)
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar user={user}>
        <div className="flex items-center gap-2 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </Button>
          <span className="text-sm font-medium text-foreground truncate">
            {project?.full_name ?? 'Sem projeto'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending || messages.length === 0}
          title="Limpar histórico"
        >
          <Trash size={18} />
        </Button>
      </Navbar>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Envie uma mensagem para começar
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {status && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 text-xs text-muted-foreground w-fit max-w-[80%] ml-10">
              <Wrench size={12} className="shrink-0 animate-pulse" />
              <span className="truncate">{status}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem para o Claude..."
            disabled={streaming}
            className="flex-1"
            autoFocus
          />
          <Button onClick={sendMessage} disabled={streaming || !input.trim()} size="icon">
            {streaming ? (
              <CircleNotch size={18} className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={18} weight="fill" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
