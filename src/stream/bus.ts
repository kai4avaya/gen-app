// Simple in-memory streaming bus for HTML chunks
export type HtmlChunk = { text: string }
export type HtmlStreamId = string

const listeners = new Map<HtmlStreamId, Set<(c: HtmlChunk) => void>>()

export function subscribeHtml(streamId: HtmlStreamId, fn: (c: HtmlChunk) => void) {
  let set = listeners.get(streamId)
  if (!set) {
    set = new Set()
    listeners.set(streamId, set)
  }
  set.add(fn)
  return () => set?.delete(fn)
}

export function publishHtml(streamId: HtmlStreamId, c: HtmlChunk) {
  const set = listeners.get(streamId)
  if (!set) return
  for (const fn of set) fn(c)
}

export function clearStream(streamId: HtmlStreamId) {
  listeners.delete(streamId)
}
