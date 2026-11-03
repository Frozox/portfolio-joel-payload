const hits = new Map<string, number[]>()

/** In-memory sliding window: per-process only, enough for a single-instance deployment. */
export const isRateLimited = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs)

  if (recent.length >= limit) {
    hits.set(key, recent)
    return true
  }

  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 1000) {
    for (const [k, timestamps] of hits) {
      if (timestamps.every((timestamp) => now - timestamp >= windowMs)) hits.delete(k)
    }
  }

  return false
}
