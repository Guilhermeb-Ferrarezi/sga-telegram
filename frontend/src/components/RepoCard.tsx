import { Star, Lock, LockOpen, Code, FolderOpen } from '@phosphor-icons/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Repo } from '@/schemas'

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-400',
  Elixir: 'bg-purple-500',
  Python: 'bg-green-500',
  Go: 'bg-cyan-500',
  Rust: 'bg-orange-500',
  Ruby: 'bg-red-500',
}

interface RepoCardProps {
  repo: Repo
}

export default function RepoCard({ repo }: RepoCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [owner, repoName] = repo.full_name.split('/')

  const mutation = useMutation({
    mutationFn: () => api.post('/api/project/use', { owner, repo: repoName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] })
      navigate('/chat')
    },
  })

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-1">
            {repo.name}
          </CardTitle>
          {repo.private ? (
            <Lock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
          ) : (
            <LockOpen size={14} className="text-muted-foreground mt-0.5 shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
          {repo.description || 'Sem descrição'}
        </p>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3 flex-1 justify-end">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${LANG_COLORS[repo.language] ?? 'bg-muted-foreground'}`}
              />
              <Code size={12} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star size={12} />
            {repo.stargazers_count}
          </span>
        </div>

        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full"
        >
          <FolderOpen size={14} />
          {mutation.isPending ? 'Clonando...' : 'Abrir'}
        </Button>
      </CardContent>
    </Card>
  )
}
