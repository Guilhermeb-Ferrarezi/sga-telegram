import { useState } from 'react'
import { User, Robot, Copy, Check, ArrowCounterClockwise, ArrowClockwise, Quotes, Star, Code } from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import elixir from 'react-syntax-highlighter/dist/esm/languages/prism/elixir'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker'

SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('sh', bash)
SyntaxHighlighter.registerLanguage('shell', bash)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('js', javascript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('ts', typescript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('py', python)
SyntaxHighlighter.registerLanguage('elixir', elixir)
SyntaxHighlighter.registerLanguage('ex', elixir)
SyntaxHighlighter.registerLanguage('exs', elixir)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('yml', yaml)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('docker', docker)
SyntaxHighlighter.registerLanguage('dockerfile', docker)
import { cn } from '@/lib/utils'
import type { Message } from '@/schemas'

function formatTime(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  return `${day} ${time}`
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-background/20 hover:bg-background/40 text-muted-foreground hover:text-foreground"
      title="Copiar código"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300/80 text-foreground rounded-sm px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  )
}

interface ChatMessageProps {
  message: Message
  onReuse?: (content: string) => void
  onRetry?: (msgId: string) => void
  onQuote?: (content: string) => void
  onPin?: (msgId: string) => void
  pinned?: boolean
  highlight?: string
  compact?: boolean
  active?: boolean
}

export default function ChatMessage({ message, onReuse, onRetry, onQuote, onPin, pinned = false, highlight = '', compact = false, active = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isError = !isUser && (message.content.startsWith('Erro:') || message.content === 'Erro ao conectar com o servidor')
  const [msgCopied, setMsgCopied] = useState(false)
  const [rawMode, setRawMode] = useState(false)

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content)
    setMsgCopied(true)
    setTimeout(() => setMsgCopied(false), 2000)
  }

  return (
    <div data-msg-id={message.id} className={cn('flex gap-3 group/msg', isUser && 'flex-row-reverse', compact && 'gap-2', active && 'bg-yellow-400/10 rounded-xl px-1 -mx-1', pinned && 'bg-primary/5 rounded-xl px-1 -mx-1')}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center shrink-0 mt-0.5',
          compact ? 'w-5 h-5' : 'w-7 h-7',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {isUser ? <User size={compact ? 10 : 14} weight="fill" /> : <Robot size={compact ? 10 : 14} weight="fill" />}
      </div>

      <div className={cn('flex flex-col', compact ? 'gap-0.5' : 'gap-1', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[80%] min-w-0 rounded-xl break-words overflow-hidden',
          compact ? 'px-3 py-1.5 text-xs leading-snug' : 'px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap'
            : 'bg-muted text-foreground rounded-tl-sm',
          highlight && message.content.toLowerCase().includes(highlight.toLowerCase()) && 'ring-2 ring-yellow-400/60',
        )}
      >
        {isUser ? (
          <HighlightText text={message.content} query={highlight} />
        ) : message.streaming && message.content === '' ? (
          <div className="flex items-center gap-1 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : rawMode ? (
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{message.content}</pre>
        ) : (
          <div className={cn(message.streaming && 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:inline-block')}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{

                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isBlock = !!match || String(children).includes('\n')

                  if (isBlock) {
                    const code = String(children).replace(/\n$/, '')
                    return (
                      <div className="relative group max-w-full overflow-x-auto">
                        <CopyButton text={code} />
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match ? match[1] : 'text'}
                          PreTag="div"
                          className="!rounded-lg !text-xs !my-2"
                          customStyle={{ overflowX: 'auto', maxWidth: '100%', wordBreak: 'normal', whiteSpace: 'pre' }}
                          {...(props as object)}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    )
                  }

                  return (
                    <code
                      className="bg-background/60 text-foreground px-1 py-0.5 rounded text-xs font-mono border border-border/50"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-0.5 pl-1">{children}</ul>
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-0.5 pl-1">{children}</ol>
                },
                li({ children }) {
                  return <li className="leading-relaxed">{children}</li>
                },
                h1({ children }) {
                  return <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>
                },
                h2({ children }) {
                  return <h2 className="text-sm font-bold mt-3 mb-1">{children}</h2>
                },
                h3({ children }) {
                  return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground my-2">
                      {children}
                    </blockquote>
                  )
                },
                hr() {
                  return <hr className="border-border/40 my-3" />
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {children}
                    </a>
                  )
                },
                strong({ children }) {
                  return <strong className="font-semibold">{children}</strong>
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-2">
                      <table className="text-xs border-collapse w-full">{children}</table>
                    </div>
                  )
                },
                th({ children }) {
                  return (
                    <th className="border border-border/40 px-2 py-1 bg-background/40 font-semibold text-left">
                      {children}
                    </th>
                  )
                },
                td({ children }) {
                  return <td className="border border-border/40 px-2 py-1">{children}</td>
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {message.createdAt && !message.streaming && (
        <span className="text-[10px] text-muted-foreground/60 px-1">
          {formatTime(message.createdAt)}
        </span>
      )}

      {!message.streaming && (
        <div className="flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
          {onPin && (
            <button
              onClick={() => onPin(message.id)}
              className={cn('flex items-center gap-1 text-xs px-1 py-0.5 rounded', pinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-foreground')}
              title={pinned ? 'Desafixar' : 'Fixar mensagem'}
            >
              <Star size={12} weight={pinned ? 'fill' : 'regular'} />
              {pinned ? 'Fixada' : 'Fixar'}
            </button>
          )}
          {!isUser && !message.streaming && (
            <button
              onClick={() => setRawMode((v) => !v)}
              className={cn('flex items-center gap-1 text-xs px-1 py-0.5 rounded', rawMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}
              title={rawMode ? 'Ver renderizado' : 'Ver markdown bruto'}
            >
              <Code size={12} />
              {rawMode ? 'Renderizado' : 'Raw'}
            </button>
          )}
          {onQuote && (
            <button
              onClick={() => onQuote(message.content)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
              title="Citar mensagem"
            >
              <Quotes size={12} />
              Citar
            </button>
          )}
          {isUser && onReuse && (
            <button
              onClick={() => onReuse(message.content)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
              title="Reutilizar mensagem"
            >
              <ArrowCounterClockwise size={12} />
              Editar
            </button>
          )}
          {!isUser && (
            <>
              {isError && onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 px-1 py-0.5 rounded"
                  title="Tentar novamente"
                >
                  <ArrowClockwise size={12} />
                  Tentar novamente
                </button>
              )}
              <button
                onClick={copyMessage}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
                title="Copiar mensagem"
              >
                {msgCopied ? <Check size={12} /> : <Copy size={12} />}
                {msgCopied ? 'Copiado' : 'Copiar'}
              </button>
            </>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
