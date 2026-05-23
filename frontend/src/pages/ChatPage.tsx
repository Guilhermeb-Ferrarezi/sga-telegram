import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PaperPlaneTilt, Trash, ArrowLeft, Wrench, Stop, ArrowDown, MagnifyingGlass, X, DownloadSimple, Question, FileArrowUp, ArrowUp, Rows, TextAa, ChartBar, Bell, BellSlash, Eye, EyeSlash, BookOpen } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '@/lib/api'
import { ProjectStatusSchema, UserSchema, SSEEventSchema, HistoryResponseSchema } from '@/schemas'
import type { Message } from '@/schemas'
import Navbar from '@/components/Navbar'
import ChatMessage from '@/components/ChatMessage'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const SUGGESTIONS = [
  'Quais serviços estão rodando no Easypanel?',
  'Mostra os logs do último deploy',
  'Como está a saúde da infraestrutura?',
  'Liste os domínios configurados no Cloudflare',
]

export default function ChatPage() {
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [input, setInput] = useState(() => localStorage.getItem('chat_draft') ?? '')
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchIndex, setSearchIndex] = useState(0)
  const [compact, setCompact] = useState(() => localStorage.getItem('chat_compact') === 'true')
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('chat_fontsize') ?? 14))
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'assistant' | 'pinned'>('all')
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => JSON.parse(localStorage.getItem('chat_pinned') ?? '[]'))
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('chat_sound') !== 'false')
  const [previewMode, setPreviewMode] = useState(false)
  const [readingMode, setReadingMode] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  const { isLoading: isLoadingHistory } = useQuery({
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

  const filteredMessages = messages
    .filter((m) => {
      if (roleFilter === 'pinned') return pinnedIds.includes(m.id)
      if (roleFilter !== 'all') return m.role === roleFilter
      return true
    })
    .filter((m) => !searchQuery.trim() || m.content.toLowerCase().includes(searchQuery.toLowerCase()))

  const totalTokens = Math.ceil(messages.reduce((acc, m) => acc + m.content.length, 0) / 4)

  useEffect(() => { setSearchIndex(0) }, [searchQuery])

  useEffect(() => {
    if (input) {
      localStorage.setItem('chat_draft', input)
    } else {
      localStorage.removeItem('chat_draft')
    }
  }, [input])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        setTimeout(() => searchRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
        setReadingMode(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const originalTitle = document.title
    function onVisibilityChange() {
      if (!document.hidden) document.title = originalTitle
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      document.title = originalTitle
    }
  }, [])

  function requestClear() {
    setConfirmingClear(true)
    setTimeout(() => setConfirmingClear(false), 4000)
  }

  function confirmClear() {
    setConfirmingClear(false)
    clearMutation.mutate()
  }

  function exportConversation() {
    const lines = messages.map((m) => {
      const role = m.role === 'user' ? '**Você**' : '**Claude**'
      return `${role}\n\n${m.content}`
    })
    const md = lines.join('\n\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversa-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  function retryMessage(failedMsgId: string) {
    const idx = messages.findIndex((m) => m.id === failedMsgId)
    if (idx <= 0) return
    const userMsg = messages[idx - 1]
    if (!userMsg || userMsg.role !== 'user') return
    setMessages((prev) => prev.filter((m) => m.id !== failedMsgId))
    sendMessage(userMsg.content)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.items[0]?.kind === 'file') setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    const text = await file.text()
    const label = `\`\`\`\n// ${file.name}\n${text}\n\`\`\``
    setInput((prev) => (prev ? `${prev}\n\n${label}` : label))
    inputRef.current?.focus()
  }

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const isAtBottom = distanceFromBottom <= 120
    setShowScrollBtn(!isAtBottom)
    if (isAtBottom) setUnreadCount(0)
  }, [])

  function scrollToBottom() {
    setUnreadCount(0)
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToSearchResult(idx: number) {
    const msg = filteredMessages[idx]
    if (!msg) return
    const el = document.querySelector(`[data-msg-id="${msg.id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function navigateSearch(dir: 1 | -1) {
    if (filteredMessages.length === 0) return
    const next = (searchIndex + dir + filteredMessages.length) % filteredMessages.length
    setSearchIndex(next)
    scrollToSearchResult(next)
  }

  function quoteMessage(content: string) {
    const excerpt = content.split('\n').slice(0, 3).join('\n')
    const quoted = excerpt.split('\n').map((l) => `> ${l}`).join('\n')
    setInput((prev) => (prev ? `${prev}\n\n${quoted}\n\n` : `${quoted}\n\n`))
    setTimeout(() => {
      const el = inputRef.current
      if (!el) return
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }, 0)
  }

  function toggleCompact() {
    setCompact((v) => {
      localStorage.setItem('chat_compact', String(!v))
      return !v
    })
  }

  function adjustFontSize(delta: number) {
    setFontSize((v) => {
      const next = Math.min(20, Math.max(12, v + delta))
      localStorage.setItem('chat_fontsize', String(next))
      return next
    })
  }

  function togglePin(msgId: string) {
    setPinnedIds((prev) => {
      const next = prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
      localStorage.setItem('chat_pinned', JSON.stringify(next))
      return next
    })
  }

  function playPing() {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch { /* AudioContext pode falhar em alguns contextos */ }
  }

  function formatDateSeparator(ts: number): string {
    const date = new Date(ts)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === now.toDateString()) return 'Hoje'
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem'
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  }

  function toggleSound() {
    setSoundEnabled((v) => {
      localStorage.setItem('chat_sound', String(!v))
      return !v
    })
  }

  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setUnreadCount((n) => n + 1)
    }
  }, [messages, showScrollBtn])

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/api/chat/history'),
    onSuccess: () => {
      setMessages([])
      setHistoryLoaded(false)
    },
  })

  function stopStreaming() {
    abortControllerRef.current?.abort()
  }

  async function sendMessage(promptOverride?: string) {
    const prompt = (promptOverride ?? input).trim()
    if (!prompt || streaming) return

    if (!promptOverride) {
      setInputHistory((prev) => [prompt, ...prev.slice(0, 49)])
      setHistoryIndex(-1)
      setInput('')
    }
    setStreaming(true)
    setStatus(null)

    const now = Date.now()
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: prompt, createdAt: now }
    const assistantMsgId = crypto.randomUUID()
    const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', streaming: true, createdAt: now }

    setMessages((prev) => [...prev, userMsg, assistantMsg])

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
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
    } catch (err) {
      setStatus(null)
      const isAbort = err instanceof DOMException && err.name === 'AbortError'
      setMessages((prev) =>
        prev.map((m) =>
          m.streaming
            ? { ...m, content: isAbort ? m.content || '_(interrompido)_' : 'Erro ao conectar com o servidor', streaming: false }
            : m,
        ),
      )
    } finally {
      setStatus(null)
      setStreaming(false)
      if (document.hidden) {
        document.title = '● Nova resposta — Claude Code'
      }
      if (soundEnabled) playPing()
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
      return
    }

    if (e.key === 'ArrowUp' && !e.shiftKey && inputHistory.length > 0) {
      const el = e.currentTarget
      const cursorAtStart = el.selectionStart === 0 && el.selectionEnd === 0
      const isEmpty = input === ''
      if (isEmpty || cursorAtStart) {
        e.preventDefault()
        const nextIndex = Math.min(historyIndex + 1, inputHistory.length - 1)
        setHistoryIndex(nextIndex)
        setInput(inputHistory[nextIndex])
        setTimeout(() => { el.selectionStart = el.selectionEnd = inputHistory[nextIndex].length }, 0)
      }
    }

    if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault()
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      setInput(nextIndex < 0 ? '' : inputHistory[nextIndex])
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  function reuseMessage(content: string) {
    setInput(content)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar user={user}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} />
          </Button>
          {searchOpen ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigateSearch(e.shiftKey ? -1 : 1)
                }}
                placeholder="Buscar nas mensagens..."
                className="flex-1 bg-transparent text-sm outline-none border-b border-border pb-0.5 placeholder:text-muted-foreground"
              />
              {searchQuery && filteredMessages.length > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {searchIndex + 1}/{filteredMessages.length}
                </span>
              )}
              {searchQuery && filteredMessages.length === 0 && (
                <span className="text-xs text-muted-foreground shrink-0">sem resultados</span>
              )}
              <button onClick={() => navigateSearch(-1)} disabled={filteredMessages.length === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1" title="Anterior (Shift+Enter)">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => navigateSearch(1)} disabled={filteredMessages.length === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1" title="Próximo (Enter)">
                <ArrowDown size={14} />
              </button>
              <Button variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                <X size={16} />
              </Button>
            </div>
          ) : (
            <span className="text-sm font-medium text-foreground truncate">
              {project?.full_name ?? 'Sem projeto'}
            </span>
          )}
        </div>
        {messages.length > 0 && (
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowStats((v) => !v)} title="Estatísticas">
              <ChartBar size={18} />
            </Button>
            {showStats && (
              <div className="absolute top-full right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg p-3 w-56 z-10 text-xs space-y-1.5">
                <p className="font-semibold text-foreground mb-2">Estatísticas</p>
                {[
                  ['Total de mensagens', messages.length],
                  ['Suas mensagens', messages.filter(m => m.role === 'user').length],
                  ['Respostas do Claude', messages.filter(m => m.role === 'assistant').length],
                  ['Tokens estimados', `~${totalTokens.toLocaleString('pt-BR')}`],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between text-muted-foreground">
                    <span>{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <Button
          variant={readingMode ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setReadingMode((v) => !v)}
          title={readingMode ? 'Sair do modo leitura (Esc)' : 'Modo leitura'}
          disabled={messages.length === 0}
        >
          <BookOpen size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50) }}
          title="Buscar (Ctrl+F)"
          disabled={messages.length === 0}
        >
          <MagnifyingGlass size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={exportConversation}
          disabled={messages.length === 0}
          title="Exportar conversa"
        >
          <DownloadSimple size={18} />
        </Button>
        <Button
          variant={compact ? 'secondary' : 'ghost'}
          size="icon"
          onClick={toggleCompact}
          title={compact ? 'Modo normal' : 'Modo compacto'}
        >
          <Rows size={18} />
        </Button>
        {confirmingClear ? (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">Apagar tudo?</span>
            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={confirmClear}>
              Sim
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmingClear(false)}>
              Não
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={requestClear}
            disabled={clearMutation.isPending || messages.length === 0}
            title="Limpar histórico"
          >
            <Trash size={18} />
          </Button>
        )}
      </Navbar>

      {messages.length > 0 && (
        <div className="border-b border-border/50 px-4 py-1.5 flex gap-1 items-center">
          {([['all', 'Todas'], ['user', 'Minhas'], ['assistant', 'Claude'], ['pinned', `⭐ ${pinnedIds.length}`]] as const).map(([role, label]) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-2.5 py-0.5 rounded-full text-xs transition-colors ${roleFilter === role ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground self-center">
            {filteredMessages.length} de {messages.length}
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 relative"
        style={{ fontSize }}
      >
        {dragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/90 border-2 border-dashed border-primary rounded-lg pointer-events-none">
            <FileArrowUp size={40} className="text-primary" />
            <p className="text-sm font-medium text-primary">Solte o arquivo para incluir no chat</p>
          </div>
        )}
        <div className="max-w-3xl mx-auto space-y-2">
          {isLoadingHistory && !historyLoaded && (
            <div className="space-y-4 pt-2">
              {[
                { side: 'right', widths: ['w-48', 'w-32'] },
                { side: 'left', widths: ['w-64', 'w-80', 'w-40'] },
                { side: 'right', widths: ['w-56'] },
                { side: 'left', widths: ['w-72', 'w-48'] },
              ].map((row, i) => (
                <div key={i} className={`flex gap-3 ${row.side === 'right' ? 'flex-row-reverse' : ''}`}>
                  <Skeleton className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                  <div className={`flex flex-col gap-1.5 max-w-[70%] ${row.side === 'right' ? 'items-end' : ''}`}>
                    {row.widths.map((w, j) => (
                      <Skeleton key={j} className={`h-4 rounded-md ${w}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!isLoadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <p className="text-muted-foreground text-sm">Envie uma mensagem para começar</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/60 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {searchQuery && filteredMessages.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Nenhuma mensagem encontrada para "{searchQuery}"
            </div>
          )}
          {filteredMessages.map((msg, i) => {
            const prev = filteredMessages[i - 1]
            const showDateSep = msg.createdAt && (!prev?.createdAt || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString())
            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] text-muted-foreground/70 shrink-0">{formatDateSeparator(msg.createdAt!)}</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                )}
                <ChatMessage
                  message={msg}
                  onReuse={readingMode ? undefined : reuseMessage}
                  onRetry={readingMode ? undefined : retryMessage}
                  onQuote={readingMode ? undefined : quoteMessage}
                  onPin={togglePin}
                  pinned={pinnedIds.includes(msg.id)}
                  highlight={searchQuery}
                  compact={compact}
                  active={searchOpen && searchQuery.trim() !== '' && i === searchIndex}
                />
              </div>
            )
          })}

          {status && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 text-xs text-muted-foreground w-fit max-w-[80%] ml-10">
              <Wrench size={12} className="shrink-0 animate-pulse" />
              <span className="truncate">{status}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 z-10 flex flex-col items-center gap-0.5"
            title="Ir ao final"
          >
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity">
              <ArrowDown size={16} weight="bold" />
            </div>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none shadow">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>

      {readingMode && (
        <div className="border-t border-border px-4 py-2 flex justify-center">
          <button onClick={() => setReadingMode(false)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
            <EyeSlash size={13} /> Sair do modo leitura <kbd className="font-mono bg-muted px-1 rounded text-[10px]">Esc</kbd>
          </button>
        </div>
      )}

      {!readingMode && <div className="border-t border-border px-4 py-3 relative">
        {showShortcuts && (
          <div className="absolute bottom-full right-4 mb-2 bg-popover border border-border rounded-lg shadow-lg p-3 w-72 z-10 text-xs">
            <p className="font-semibold text-foreground mb-2">Atalhos de teclado</p>
            <div className="space-y-1.5 text-muted-foreground">
              {[
                ['Enter', 'Enviar mensagem'],
                ['Shift + Enter', 'Nova linha'],
                ['↑ / ↓', 'Navegar histórico de inputs'],
                ['Ctrl + F', 'Buscar nas mensagens'],
                ['Escape', 'Fechar busca'],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between gap-4">
                  <kbd className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{key}</kbd>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <div className="flex items-center gap-0.5 mb-1 shrink-0">
            <button
              onClick={() => setShowShortcuts((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              title="Atalhos de teclado"
            >
              <Question size={16} />
            </button>
            <button
              onClick={() => adjustFontSize(-1)}
              disabled={fontSize <= 12}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
              title="Diminuir fonte"
            >
              <TextAa size={13} />
            </button>
            <button
              onClick={() => adjustFontSize(1)}
              disabled={fontSize >= 20}
              className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors p-0.5"
              title="Aumentar fonte"
            >
              <TextAa size={17} />
            </button>
            <button
              onClick={toggleSound}
              className={`transition-colors p-0.5 ${soundEnabled ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? <Bell size={15} /> : <BellSlash size={15} />}
            </button>
            <button
              onClick={() => setPreviewMode((v) => !v)}
              className={`transition-colors p-0.5 ${previewMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title={previewMode ? 'Editar mensagem' : 'Preview markdown'}
              disabled={!input.trim()}
            >
              {previewMode ? <EyeSlash size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            {previewMode ? (
              <div
                onClick={() => setPreviewMode(false)}
                className="min-h-[38px] max-h-[200px] overflow-y-auto rounded-md border border-primary bg-background px-3 py-2 text-sm cursor-text prose prose-sm dark:prose-invert max-w-none"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{input}</ReactMarkdown>
              </div>
            ) : (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Mensagem para o Claude..."
              disabled={streaming}
              rows={1}
              autoFocus
              className="w-full resize-none overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '200px' }}
            />
            )}
            {input.length > 0 && !previewMode && (
              <span className={`text-xs self-end pr-1 ${input.length > 4000 ? 'text-destructive' : input.length > 2000 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                {input.length.toLocaleString('pt-BR')} chars · ~{Math.ceil(input.length / 4).toLocaleString('pt-BR')} tokens
              </span>
            )}
          </div>
          {streaming ? (
            <Button onClick={stopStreaming} size="icon" variant="destructive" title="Parar geração">
              <Stop size={18} weight="fill" />
            </Button>
          ) : (
            <Button onClick={() => { setPreviewMode(false); sendMessage() }} disabled={!input.trim()} size="icon">
              <PaperPlaneTilt size={18} weight="fill" />
            </Button>
          )}
        </div>
      </div>}
    </div>
  )
}
