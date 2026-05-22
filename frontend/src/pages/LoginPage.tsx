import { GithubLogo, ChatCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  function handleGitHubLogin() {
    window.location.href = '/api/auth/github'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ChatCircle size={32} weight="fill" className="text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Claude Code
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Interface web para o Claude Code CLI
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            className="w-full gap-3 text-base"
            onClick={handleGitHubLogin}
          >
            <GithubLogo size={20} weight="fill" />
            Entrar com GitHub
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Ao entrar, você concorda em usar este serviço para gerenciar
            seus repositórios via Claude Code.
          </p>
        </div>
      </div>
    </div>
  )
}
