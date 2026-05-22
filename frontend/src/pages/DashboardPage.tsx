import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MagnifyingGlass } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import RepoCard from '@/components/RepoCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { RepoSchema, type Repo } from '@/schemas'
import { z } from 'zod'

export default function DashboardPage() {
  const [search, setSearch] = useState('')

  const { data: repos, isLoading, isError } = useQuery({
    queryKey: ['repos'],
    queryFn: async () => {
      const res = await api.get('/api/repos', {
        params: { page: 1, per_page: 30 },
      })
      return z.array(RepoSchema).parse(res.data)
    },
    staleTime: 2 * 60 * 1000,
  })

  const filtered = repos?.filter((repo: Repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase()) ||
    (repo.description ?? '').toLowerCase().includes(search.toLowerCase()),
  ) ?? []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold">Seus repositórios</h2>
          <p className="text-sm text-muted-foreground">
            Selecione um repositório para abrir com o Claude Code
          </p>
        </div>

        <div className="mb-6 relative max-w-sm">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Buscar repositório..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-destructive font-medium">Erro ao carregar repositórios</p>
            <p className="text-sm text-muted-foreground mt-1">
              Verifique sua conexão e tente novamente
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">Nenhum repositório encontrado</p>
            {search && (
              <p className="text-sm text-muted-foreground mt-1">
                Tente buscar por outro termo
              </p>
            )}
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((repo: Repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
