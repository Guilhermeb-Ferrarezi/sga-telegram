import { useQueryClient } from '@tanstack/react-query'
import { ChatCircle, SignOut } from '@phosphor-icons/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { User } from '@/schemas'

interface NavbarProps {
  user?: User
  children?: React.ReactNode
}

export default function Navbar({ user, children }: NavbarProps) {
  const queryClient = useQueryClient()

  function handleSignOut() {
    queryClient.clear()
    window.location.href = '/api/auth/logout'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 flex h-14 items-center gap-3">
        <div className="flex items-center gap-2 font-semibold shrink-0">
          <ChatCircle size={20} weight="fill" className="text-primary" />
          <span className="hidden sm:inline">Claude Code</span>
        </div>

        <div className="flex-1 flex items-center gap-2">
          {children}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.avatar_url} alt={user.login} />
                  <AvatarFallback>{user.login.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline">
                  {user.name ?? user.login}
                </span>
              </div>
              <Separator orientation="vertical" className="h-5" />
            </>
          )}
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
            <SignOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}
