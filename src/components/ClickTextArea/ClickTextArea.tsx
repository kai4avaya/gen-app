import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme, Snackbar, Alert } from '@mui/material'
import { useStore } from '@livestore/react'
import { events } from '../../livestore/schema'
import { runAgent } from '../../agents/agent'

import { streamHtmlToLiveStore } from '../../utils/llmStreamHtml'
import { SYSTEM_PROMPT_HTML } from '../../agents/prompts/prompt'
import AILoader from '../AILoader/AILoader'

export type ClickTextAreaProps = {
  visible: boolean
  x: number
  y: number
  fontSizeRem?: number
  onFirstType?: () => void
  containerWidth?: number
  hideUnfocused?: boolean
  onFocusChange?: (focused: boolean) => void
}

// Renders a transparent textarea positioned at (x, y) within a relatively positioned container
const ClickTextArea: React.FC<ClickTextAreaProps> = ({ visible, x, y, fontSizeRem = 1.5, onFirstType, containerWidth, hideUnfocused = false, onFocusChange }) => {
  const { store } = useStore()
  const theme = useTheme()
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const hasTypedRef = useRef(false)
  const ref = useRef<HTMLTextAreaElement | null>(null)
  const agentAbortRef = useRef<AbortController | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [computedWidth, setComputedWidth] = useState<number>(() => Math.min(window.innerWidth * 0.7, 900))
  const [showConfigAlert, setShowConfigAlert] = useState(false)

  // DIAGNOSTICS: log component mount and props
  useEffect(() => {
    console.log('[ClickTextArea] Component mounted with props:', { visible, x, y, hideUnfocused, isFocused });
    return () => {
      console.log('[ClickTextArea] Component unmounted');
    };
  }, []);

  // DIAGNOSTICS: log prop changes
  useEffect(() => {
    console.log('[ClickTextArea] Props changed:', { visible, x, y, hideUnfocused, isFocused });
  }, [visible, x, y, hideUnfocused, isFocused]);

  // Focus the textarea when it becomes visible or moves
  useEffect(() => {
    if (visible && ref.current) {
      ref.current.focus()
      // place caret at end
      const len = ref.current.value.length
      ref.current.setSelectionRange(len, len)
    }
  }, [visible, x, y])

  useEffect(() => {
    const viewportCap = Math.min(window.innerWidth * 0.7, 900)
    const containerCap = (containerWidth ?? window.innerWidth) - x - 16 // leave some right padding
    const safeWidth = Math.max(40, Math.min(viewportCap, containerCap))
    setComputedWidth(safeWidth)
  }, [x, containerWidth])

  const style = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    left: x,
    top: y,
    // Anchor exactly at click point; grow downward as content increases
    background: 'transparent',
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: `${fontSizeRem}rem`,
    fontFamily: 'Inter, sans-serif',
    color: theme.palette.text.primary,
    width: `${computedWidth}px`,
    minHeight: '1.6em',
    lineHeight: 1.4,
    zIndex: 2,
    padding: 0,
    margin: 0,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    caretColor: theme.palette.text.primary,
  }), [x, y, fontSizeRem, computedWidth])

  // helper to auto-size height
  const autosize = () => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, window.innerHeight * 0.6) + 'px'
      ref.current.style.overflowY = ref.current.scrollHeight > window.innerHeight * 0.6 ? 'auto' : 'hidden'
    }
  }

  useEffect(() => {
    if (visible) autosize()
  }, [visible, value])


  // Debounced agent call logic: stream HTML to console
  useEffect(() => {
    if (!visible) return
    const settingsRaw = localStorage.getItem('app-settings')
    let apiKey = ''
    let modelName = ''
    try {
      const parsed = settingsRaw ? JSON.parse(settingsRaw) : null
      apiKey = parsed?.openRouterKey ?? ''
      modelName = parsed?.modelName ?? ''
    } catch {}

    if (!apiKey) return

    let aborted = false
    let isMounted = true 
    const handler = setTimeout(() => {
      if (aborted || !isMounted) return
      if (value.trim().split(/\s+/).length < 3) return

  // Abort any in-flight request
      agentAbortRef.current?.abort()
      const controller = new AbortController()
      agentAbortRef.current = controller

      // Set AI thinking state to true when starting
      setIsAIThinking(true)

      const SIMPLE_HTML = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>App</title>\n</head>\n<body>\n</body>\n</html>`
  const SYSTEM_PROMPT = SYSTEM_PROMPT_HTML

      // Stream HTML to LiveStore and log only the final output at the end
      void streamHtmlToLiveStore({
        SIMPLE_HTML,
        SYSTEM_PROMPT,
        apiKey,
        modelName,
        store,
        agentAbortRef,
        setErrorMsg,
        value,
      }).finally(() => {
        // Set AI thinking state to false when done
        // setIsAIThinking(false)
        if (isMounted && !aborted) {
          setIsAIThinking(false)
        }
      })
      return () => {
        aborted = true
        isMounted = false
        clearTimeout(handler)
        // Clean up any pending requests
        agentAbortRef.current?.abort()
      }
    }, 400)

    return () => {
      aborted = true
      isMounted = false
      clearTimeout(handler)
    }
  }, [value, visible])

  console.log('[ClickTextArea] Rendering decision:', { visible, hideUnfocused, isFocused, valueLength: value.trim().length, willRender: visible && !(hideUnfocused && !isFocused && value.trim()) });
  if (!visible || (hideUnfocused && !isFocused && value.trim())) return null

  return (
    <>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          // Fire onFirstType only once, on first non-empty input
          if (!hasTypedRef.current && next.trim().length > 0) {
            hasTypedRef.current = true
            onFirstType?.()
            // Check for missing config when user starts typing
            const settingsRaw = localStorage.getItem('app-settings')
            let apiKey = ''
            let modelName = ''
            try {
              const parsed = settingsRaw ? JSON.parse(settingsRaw) : null
              apiKey = parsed?.openRouterKey ?? ''
              modelName = parsed?.modelName ?? ''
            } catch {}
            if (!apiKey || !modelName) {
              setShowConfigAlert(true)
            }
          }
          // Track every change via LiveStore event
          store.commit(events.textTyped(next))
          // Auto-grow to show all content without scrolling
          autosize()
        }}
        onClick={(e) => e.stopPropagation()}
        onFocus={() => {
          setIsFocused(true)
          onFocusChange?.(true)
        }}
        onBlur={() => {
          setIsFocused(false)
          onFocusChange?.(false)
        }}
        style={style}
        autoFocus
      />
      <AILoader visible={isAIThinking} />
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorMsg(null)}
          sx={{ width: '100%' }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={showConfigAlert}
        autoHideDuration={6000}
        onClose={() => setShowConfigAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setShowConfigAlert(false)}
          sx={{ width: '100%' }}
        >
          Please configure your OpenRouter API key and model preference in settings
        </Alert>
      </Snackbar>
    </>
  )
}

export default ClickTextArea
