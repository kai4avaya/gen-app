/* Minimal agentic loop for OpenRouter with tool-calling */
import { openRouterChatStream, ORMessage } from './providers/openrouter'
import { defaultRegistry, makeRegistry, ToolDef } from './tools/registry'

export type AgentOptions = {
  apiKey: string
  model: string
  cycles?: number
  registry?: ReturnType<typeof makeRegistry>
  onTextChunk?: (text: string) => void
  systemPrompt?: string
  maxTokens?: number
  signal?: AbortSignal
  // Optional prior conversation history (excluding system). Will be prepended before the new user input.
  history?: ORMessage[]
}

export async function runAgent(userInput: string, opts: AgentOptions) {
  const { apiKey, model, cycles = 5, registry = defaultRegistry, onTextChunk, systemPrompt, maxTokens, signal, history } = opts

  const messages: ORMessage[] = [
    { role: 'system', content: systemPrompt ?? 'You are a helpful, tool-using assistant.' },
    ...((history ?? []) as ORMessage[]),
    { role: 'user', content: userInput },
  ]

  // eslint-disable-next-line no-console
  console.log('[AI] Sending messages to LLM:', JSON.stringify(messages, null, 2))

  for (let i = 0; i < cycles; i++) {
    // 1) Ask LLM (streaming)
  let toolCalls: any[] = []
  // Accumulator for streaming tool_calls deltas (merge by index)
  const partialToolCalls: Record<number, any> = {}
    let finalText = ''
  let gotAnyChunk = false

    for await (const chunk of openRouterChatStream({
      apiKey,
      model,
      messages,
      tools: registry.specs,
      stream: true,
      max_tokens: maxTokens,
      signal,
    })) {
  gotAnyChunk = true
      if (chunk.type === 'text' && chunk.text) {
        finalText += chunk.text
        onTextChunk?.(chunk.text)
      } else if (chunk.type === 'tool_calls') {
        const deltas = chunk.delta?.tool_calls ?? []
        for (const d of deltas) {
          const idx = typeof d.index === 'number' ? d.index : 0
          const existing = partialToolCalls[idx] ?? { type: 'function', function: { name: undefined, arguments: '' } }
          // Merge id/type
          if (d.id && !existing.id) existing.id = d.id
          if (d.type) existing.type = d.type
          // Merge function name/arguments (arguments stream in chunks)
          if (d.function?.name) existing.function.name = d.function.name
          if (typeof d.function?.arguments === 'string') {
            const chunkArgs = d.function.arguments
            existing.function.arguments = (existing.function.arguments || '') + chunkArgs
          }
          partialToolCalls[idx] = existing
        }
      }
    }

    // Finalize tool calls from accumulated deltas (ordered by index)
    toolCalls = Object.keys(partialToolCalls)
      .map((k) => ({ idx: Number(k), call: partialToolCalls[Number(k)] }))
      .sort((a, b) => a.idx - b.idx)
      .map((x) => {
        const call = x.call
        if (!call.id) {
          call.id = `call_${x.idx}_${Date.now().toString(36)}`
        }
        return call
      })
      .filter((c) => c && c.function && typeof c.function.name === 'string')

    // If we received tool calls, execute them and loop again; else, finish
    if (toolCalls.length > 0) {
      // Push assistant planning turn (tool_calls) for context
      messages.push({ role: 'assistant', content: null, tool_calls: toolCalls })

      for (const call of toolCalls) {
        const name = call.function?.name
        let rawArgs = call.function?.arguments
        // Some providers stream arguments with possible trailing fragments; best-effort cleanup
        if (typeof rawArgs === 'string') rawArgs = rawArgs.trim()
        let args: any = {}
        try { args = rawArgs ? JSON.parse(rawArgs) : {} } catch {
          // Try to salvage by fixing common JSON pitfalls
          try {
            const fixed = rawArgs?.replace(/,"\s*}/g, '}').replace(/,\s*]/g, ']')
            args = fixed ? JSON.parse(fixed) : {}
          } catch {}
        }
        const tool = registry.mapping[name]
        if (!tool) continue
        try {
          const result = await tool(args)
          messages.push({ role: 'tool', name, tool_call_id: call.id, content: JSON.stringify(result) })
        } catch (err: any) {
          messages.push({ role: 'tool', name, tool_call_id: call.id, content: JSON.stringify({ error: String(err?.message ?? err) }) })
        }
      }
      // Continue loop to allow the model to reason over tool results
      continue
    }

    // If no chunks at all, break so caller can decide to retry
    if (!gotAnyChunk) {
      break
    }

    // No tool calls -> we have final text
    if (finalText.trim()) {
      messages.push({ role: 'assistant', content: finalText })
      return { messages, text: finalText }
    }
  }

  return { messages: [], text: '' }
}

// Helper to build a registry from external tools with one endpoint
export function buildRegistry(tools: ToolDef[]) {
  return makeRegistry(tools)
}
