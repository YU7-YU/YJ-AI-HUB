"use client"

import { useState, useEffect, useCallback } from "react"
import { myAgentsSchema } from "@/lib/schemas/my-agents"

const STORAGE_KEY = "agenthub:myAgents"

function readMyAgents(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const result = myAgentsSchema.safeParse(parsed)
    if (result.success) return result.data
    // invalid data — reset
    localStorage.removeItem(STORAGE_KEY)
    return []
  } catch {
    return []
  }
}

function writeMyAgents(ids: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function useMyAgents(agentId: string) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [myAgentIds, setMyAgentIds] = useState<string[]>([])

  useEffect(() => {
    setIsHydrated(true)
    setMyAgentIds(readMyAgents())
  }, [])

  const isSaved = isHydrated && myAgentIds.includes(agentId)

  const toggle = useCallback(() => {
    setMyAgentIds((prev) => {
      const next = prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : prev.length >= 100
          ? prev
          : [...prev, agentId]
      writeMyAgents(next)
      return next
    })
  }, [agentId])

  return { isSaved, toggle, myAgentIds }
}
