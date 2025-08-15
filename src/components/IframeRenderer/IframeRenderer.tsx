import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@livestore/react'
import { queryDb } from '@livestore/livestore'
import { tables, events } from '../../livestore/schema'
import { subscribeHtml } from '../../stream/bus'

export type IframeRendererProps = {
  streamId: string
  pageId: string
  height?: number | string
  clearIframe?: boolean
}

const IframeRenderer: React.FC<IframeRendererProps> = ({ streamId, pageId, height = '60vh', clearIframe = false }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [buffer, setBuffer] = useState('')
  const { store } = useStore()

  // Query selection pointer history (latest row wins)
  const selection$ = useMemo(() => queryDb(
    tables.htmlSelections.where({ pageId }).orderBy('updatedAt', 'desc'),
    { label: `htmlSelections-${pageId}` }
  ), [pageId])
  const selections = store.useQuery(selection$)
  const selectedUpdatedAt = selections[0]?.selectedUpdatedAt as number | undefined

  // Query last committed pages for this pageId
  const pages$ = useMemo(() => queryDb(
    tables.htmlPages.where({ pageId }).orderBy('updatedAt', 'desc'),
    { label: `htmlPages-${pageId}` }
  ), [pageId])
  const pages = store.useQuery(pages$)

  // Ensure an initial empty state is part of history for this pageId
  useEffect(() => {
    if (pages.length === 0) {
      try {
        store.commit(events.htmlPageCommitted({
          pageId,
          html: '',
          updatedAt: Date.now(),
        }))
      } catch {}
    }
  }, [pages.length, pageId, store])

  // Choose the page based on pointer if present, else latest
  const pointed = selectedUpdatedAt ? pages.find(p => p.updatedAt === selectedUpdatedAt) : undefined
  const latest = pointed ?? pages[0]
  const hasContent = !!buffer || !!latest?.html

  // Initialize iframe shell once (transparent background)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    if (doc.body?.childNodes.length) return
    doc.open()
  doc.write('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:transparent;overflow:auto;"><div id="app-root"></div></body></html>')
    doc.close()
  }, [])

  // Relay dblclicks from inside the iframe to the parent (capture phase)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    const handler = (e: MouseEvent) => {
      // Do not disrupt iframe normal behavior; only notify parent
      try {
        window.parent?.postMessage({
          __app: 'self-gen-app',
          type: 'iframe-dblclick',
          pageId,
          x: e.clientX,
          y: e.clientY,
        }, '*')
      } catch {}
    }
    doc.addEventListener('dblclick', handler, true)
    return () => doc.removeEventListener('dblclick', handler, true)
  }, [pageId])

  // Subscribe to streaming chunks; patch iframe progressively
  useEffect(() => {
    const unsub = subscribeHtml(streamId, ({ text }) => {
      // Special control token to reset stream
      if (text === '__RESET__') {
        setBuffer('')
      } else {
        setBuffer((prev) => prev + text)
      }
    })
    return () => { unsub() }
  }, [streamId])

  // Patch the DOM at a light throttle
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    const root = doc.getElementById('app-root') || doc.body
    if (!root) return

    let rafId = 0
    const apply = () => {
      try {
        // If the stream is a full HTML doc, extract <body> content; otherwise use as-is
  // Remove trailing ::replace directive from buffer (if present)
  const html = buffer.replace(/::replace\s+([^\s]+)\s*$/m, '')
        let bodyInner = ''
        const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)
        if (m) {
          bodyInner = m[1]
        } else {
          bodyInner = html
        }
        // Progressive replace without reloading the iframe document
        root.innerHTML = bodyInner
      } catch {}
      rafId = 0
    }

    if (!rafId && buffer) rafId = requestAnimationFrame(apply)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [buffer])

  // Clear iframe content when clearIframe is true
  useEffect(() => {
    if (clearIframe) {
      setBuffer('')
      const iframe = iframeRef.current
      if (!iframe) return
      const doc = iframe.contentDocument
      if (!doc) return
      const root = doc.getElementById('app-root') || doc.body
      if (root) root.innerHTML = ''
    }
  }, [clearIframe])

  // Apply last committed HTML when stream buffer is empty (e.g., on load)
  useEffect(() => {
    if (buffer || clearIframe) return // prefer live stream or clear state
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc || !latest?.html) return
    const root = doc.getElementById('app-root') || doc.body
    if (!root) return
    try {
  const html = latest.html.replace(/::replace\s+([^\s]+)\s*$/m, '')
      const m = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html)
      const bodyInner = m ? m[1] : html
      root.innerHTML = bodyInner
    } catch {}
  }, [latest, buffer, clearIframe])

  return (
    <iframe
      ref={iframeRef}
      style={{
        width: '100%',
        height,
        border: 'none',
        background: 'transparent',
        opacity: hasContent ? 1 : 0,
  pointerEvents: 'auto',
        zIndex: 0,
      }}
    />
  )
}

export default IframeRenderer
