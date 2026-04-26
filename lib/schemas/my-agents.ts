import { z } from "zod"

export const myAgentsSchema = z
  .array(z.string().min(1).max(64))
  .max(100)
