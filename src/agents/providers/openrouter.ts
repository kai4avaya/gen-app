/* OpenRouter provider with streaming and tool-calling support */

export type ORMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string | null; tool_calls?: any[]; name?: string; tool_call_id?: string }
export type ORToolSpec = {
  type: 'function'
  function: { name: string; description?: string; parameters?: Record<string, any> }
}

export type StreamChunk = { type: 'text' | 'tool_calls' | 'done'; text?: string; delta?: any }

export type ChatOptions = {
  apiKey: string
  model: string
  messages: ORMessage[]
  tools?: ORToolSpec[]
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  parallel_tool_calls?: boolean
  stream?: boolean
  max_tokens?: number
  signal?: AbortSignal
}

export async function* openRouterChatStream(opts: ChatOptions): AsyncGenerator<StreamChunk, void, void> {
  const { apiKey, model, messages, tools, tool_choice, parallel_tool_calls, stream = true, max_tokens, signal } = opts

  let res: Response
  try {
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, tools, tool_choice, parallel_tool_calls, stream, max_tokens }),
      signal,
    })
  } catch (err: any) {
    // If aborted, just end the stream quietly
    if (err?.name === 'AbortError') {
      return
    }
    throw err
  }

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status} ${res.statusText}`)

  if (!stream) {
    const data = await res.json()
    const message = data.choices?.[0]?.message
    if (message?.tool_calls) {
      yield { type: 'tool_calls', delta: { tool_calls: message.tool_calls } }
    }
    if (message?.content) {
      yield { type: 'text', text: message.content }
    }
    yield { type: 'done' }
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    yield { type: 'done' }
    return
  }

  const decoder = new TextDecoder()
  let partial = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    partial += decoder.decode(value, { stream: true })
    const lines = partial.split('\n').filter((l) => l.trim().startsWith('data: '))

    // Keep last chunk tail if not ending with newline
    if (!partial.endsWith('\n')) {
      const lastNl = partial.lastIndexOf('\n')
      partial = lastNl >= 0 ? partial.slice(lastNl + 1) : partial
    } else {
      partial = ''
    }

    for (const line of lines) {
      const json = line.slice(6)
      if (json === '[DONE]') {
        yield { type: 'done' }
        return
      }
      try {
        const data = JSON.parse(json)
        const delta = data.choices?.[0]?.delta
        if (!delta) continue

        if (delta.tool_calls) {
          yield { type: 'tool_calls', delta: { tool_calls: delta.tool_calls } }
        }
        if (typeof delta.content === 'string') {
          yield { type: 'text', text: delta.content }
        }
        if (data.choices?.[0]?.finish_reason) {
          // finish reasons: 'stop' | 'tool_calls'
          if (data.choices[0].finish_reason === 'tool_calls') {
            // signal end of tool call planning for this turn
          }
        }
      } catch {}
    }
  }

  yield { type: 'done' }
}
