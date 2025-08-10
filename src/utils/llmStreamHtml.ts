import { runAgent } from '../agents/agent'
import { publishHtml } from '../stream/bus'
import { events, tables } from '../livestore/schema'
import { queryDb } from '@livestore/livestore'

export async function streamHtmlToLiveStore({
  SIMPLE_HTML,
  SYSTEM_PROMPT,
  apiKey,
  modelName,
  store,
  agentAbortRef,
  setErrorMsg,
  value,
}: {
  SIMPLE_HTML: string
  SYSTEM_PROMPT: string
  apiKey: string
  modelName: string
  store: any
  agentAbortRef: React.MutableRefObject<AbortController | null>
  setErrorMsg: (msg: string | null) => void
  value: string
}) {
  // Abort any in-flight request
  if (agentAbortRef.current) {
    try {
      // eslint-disable-next-line no-console
      console.log('[AI] Aborting previous stream request')
      agentAbortRef.current.abort()
    } catch {}
  }
  const controller = new AbortController()
  agentAbortRef.current = controller

  // Stream chunks to bus, accumulate final output
  let final = ''
  try {
    // Pull the latest committed HTML for page 'main' (if any) for context
    let latestHtml = ''
    try {
      const rows = store.query({
        query: "SELECT html FROM htmlPages WHERE pageId = 'main' ORDER BY updatedAt DESC LIMIT 1",
        bindValues: {},
      }) as { html: string }[]
      latestHtml = rows?.[0]?.html ?? ''
    } catch {}

    // Build a rich user input payload that includes the user's textarea prompt and the current page HTML
    const userPayload = [
      'USER_PROMPT:\n' + value.trim(),
      latestHtml ? ('\n\nCURRENT_PAGE_HTML:\n' + latestHtml) : '',
    ].join('')

    // Debug: log inputs and payload lengths (not the whole HTML to reduce noise)
    // eslint-disable-next-line no-console
    console.log('[AI] stream start', { model: modelName, valueLen: value?.length ?? 0, latestHtmlLen: latestHtml?.length ?? 0 })
    // eslint-disable-next-line no-console
    console.log('[AI] userPayload preview:', userPayload.slice(0, 240))

    // Load prior short conversation history (optional): last 4 turns for page 'main'
    let history: any[] | undefined
    try {
      // Create a small ephemeral table for history if it doesn't exist yet
      store.exec?.("CREATE TABLE IF NOT EXISTS convoHistory (id TEXT PRIMARY KEY, pageId TEXT, role TEXT, content TEXT, ts INTEGER)")
      const hist = store.query({
        query: "SELECT role, content FROM convoHistory WHERE pageId = 'main' ORDER BY ts DESC LIMIT 8",
        bindValues: {},
      }) as { role: 'user'|'assistant'|'tool'; content: string }[]
      history = hist?.reverse()?.map((h) => ({ role: h.role, content: h.content }))
    } catch {}

    // Try up to 2 attempts if no HTML is produced (e.g., after an abort or flaky response)
    const maxAttempts = 2
    let attempt = 0
    let chunkCount = 0
    let activeModel = modelName || 'openai/gpt-4o-mini'

    while (attempt < maxAttempts) {
      if (controller.signal.aborted) return
      attempt++
      final = ''
      chunkCount = 0
      // Publish a reset token so the IframeRenderer clears between runs
      publishHtml('page:main', { text: '__RESET__' })
      // eslint-disable-next-line no-console
      console.log(`[AI] attempt ${attempt}/${maxAttempts} with model=${activeModel}`)
      await runAgent(userPayload || SIMPLE_HTML, {
        apiKey,
        model: activeModel,
        cycles: 2, // allow a follow-up turn after any tool calls
        systemPrompt: SYSTEM_PROMPT,
        maxTokens: 1000,
        signal: controller.signal,
        history,
        onTextChunk: (chunk) => {
          final += chunk
          chunkCount++
          publishHtml('page:main', { text: chunk })
        },
      })

      // Strip optional ::replace directive from final before evaluating
      const dirMatchInner = /::replace\s+([^\s]+)\s*$/m.exec(final)
      if (dirMatchInner) {
        final = final.replace(/::replace\s+([^\s]+)\s*$/m, '')
      }

      // eslint-disable-next-line no-console
      console.log('[AI] attempt result', { chunkCount, length: final.length })

      if (final.trim().length > 0) break

      // Optional model fallback on retry if nothing streamed
      if (attempt < maxAttempts) {
        // eslint-disable-next-line no-console
        console.warn('[AI] empty response; retrying...')
        if (activeModel.includes('gpt-oss')) {
          activeModel = 'openai/gpt-4o-mini'
        }
        // small delay to let state settle after aborts
        await new Promise((r) => setTimeout(r, 150))
      }
    }

    // If still empty, surface a soft error and stop without committing
    if (!final.trim()) {
      // eslint-disable-next-line no-console
      console.error('[AI] No HTML produced after retry; skipping commit')
      setErrorMsg?.('AI did not return HTML. Please try again.')
      return
    }

    // Commit final HTML to LiveStore
    store.commit(events.htmlPageCommitted({ pageId: 'main', html: final, updatedAt: Date.now() }))
    // Persist conversation turn for lightweight history
    try {
      const ts = Date.now()
      const uid = `${ts}-u`
      const aid = `${ts}-a`
      store.exec?.("CREATE TABLE IF NOT EXISTS convoHistory (id TEXT PRIMARY KEY, pageId TEXT, role TEXT, content TEXT, ts INTEGER)")
      store.exec?.("INSERT INTO convoHistory (id, pageId, role, content, ts) VALUES (?, 'main', 'user', ?, ?)", [uid, userPayload, ts])
      store.exec?.("INSERT INTO convoHistory (id, pageId, role, content, ts) VALUES (?, 'main', 'assistant', ?, ?)", [aid, final, ts])
    } catch {}
    // Log the entire output at the end
    // eslint-disable-next-line no-console
    console.log('[AI] final streamed HTML:', final)
  } catch (err: any) {
    if (err?.name === 'AbortError') return
    // eslint-disable-next-line no-console
    console.error('[AI] error', err)
    const message: string =
      typeof err?.message === 'string' && err.message.includes('401')
        ? 'OpenRouter unauthorized (401). Set a valid API key in Settings.'
        : (typeof err?.message === 'string' ? err.message : 'Unexpected AI error. Please try again.')
    setErrorMsg(message)
  }
}
