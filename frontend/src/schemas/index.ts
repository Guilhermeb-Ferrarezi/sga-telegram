import { z } from 'zod'

export const UserSchema = z.object({
  login: z.string(),
  avatar_url: z.string().url(),
  name: z.string().nullable().optional(),
})

export type User = z.infer<typeof UserSchema>

export const RepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  description: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  stargazers_count: z.number(),
  private: z.boolean(),
  html_url: z.string().url(),
  updated_at: z.string().nullable().optional(),
})

export type Repo = z.infer<typeof RepoSchema>

export const ProjectStatusSchema = z.object({
  path: z.string(),
  full_name: z.string(),
})

export type ProjectStatus = z.infer<typeof ProjectStatusSchema>

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  streaming: z.boolean().optional(),
})

export type Message = z.infer<typeof MessageSchema>

export const SSEEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('chunk'), text: z.string() }),
  z.object({ type: z.literal('status'), text: z.string() }),
  z.object({ type: z.literal('done'), text: z.string() }),
  z.object({ type: z.literal('error'), text: z.string() }),
])

export type SSEEvent = z.infer<typeof SSEEventSchema>
