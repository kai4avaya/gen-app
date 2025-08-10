// Ensure correct base for LiveStore dev fetch URLs in both main thread and workers
// This must run before any @livestore/adapter-web imports execute
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
try {
  const base = typeof location !== 'undefined' && (location as Location).origin
    ? `${(location as Location).origin}/`
    : '/'
  g.__livestoreDevBase = base
} catch {
  g.__livestoreDevBase = '/'
}

export {}
