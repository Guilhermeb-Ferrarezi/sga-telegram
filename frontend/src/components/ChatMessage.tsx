import { User, Robot } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Message } from '@/schemas'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? <User size={14} weight="fill" /> : <Robot size={14} weight="fill" />}
      </div>

      <div className={cn(
        'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-muted text-foreground rounded-tl-sm',
        message.streaming && 'after:content-["▋"] after:animate-pulse after:ml-0.5'
      )}>
        {message.content}
      </div>
    </div>
  )
}
