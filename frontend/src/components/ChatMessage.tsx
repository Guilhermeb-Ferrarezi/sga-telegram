import { User, Robot } from '@phosphor-icons/react'
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

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {isUser ? <User size={14} weight="fill" /> : <Robot size={14} weight="fill" />}
      </div>

      <div
        className={cn(
          'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap'
            : 'bg-muted text-foreground rounded-tl-sm',
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <div className={cn(message.streaming && 'after:content-["▋"] after:animate-pulse after:ml-0.5 after:inline-block')}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const isBlock = !!match || String(children).includes('\n')

                  if (isBlock) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match ? match[1] : 'text'}
                        PreTag="div"
                        className="!rounded-lg !text-xs !my-2"
                        {...(props as object)}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
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
    </div>
  )
}
