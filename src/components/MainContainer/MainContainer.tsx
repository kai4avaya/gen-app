import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import TypingEffect from '../TypingEffect/TypingEffect';
import PolygonBackground from '../PolygonBackground/PolygonBackground';
import ClickTextArea from '../ClickTextArea/ClickTextArea'
import UndoRedoToolbar from '../UndoRedoToolbar/UndoRedoToolbar'
import { useStore } from '@livestore/react'
import { queryDb } from '@livestore/livestore'
import { events, tables } from '../../livestore/schema'
import GlobalOverlay from '../GlobalOverlay/GlobalOverlay'
import IframeRenderer from '../IframeRenderer/IframeRenderer'

// STARTUP DIAGNOSTIC: confirm module evaluated
console.log('[BOOT] MainContainer module loaded')

const AppContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: theme.palette.background.default,
  cursor: 'text',
  position: 'relative',
  overflow: 'hidden'
}));

const ContentWrapper = styled(Stack)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  position: 'relative'
}));

const ClickOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  cursor: 'text',
  pointerEvents: 'none',
});

export type MainContainerProps = {
  onThemeChange?: (isDark: boolean) => void
}

const MainContainer: React.FC<MainContainerProps> = ({ onThemeChange }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); // session-only
  const [hideUnfocused, setHideUnfocused] = useState(false);
  const [clearIframe, setClearIframe] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { store } = useStore()
  // Ref indirection to avoid temporal-dead-zone when using the handler in early effects
  const handleDoubleClickRef = useRef<((e: React.MouseEvent) => void) | null>(null)

  // GLOBAL DIAGNOSTICS: capture all dblclicks in capture phase
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const path = (e.composedPath ? e.composedPath() : [])
        .map((el: any) => (el?.tagName || el?.nodeName || typeof el))
        .slice(0, 10)
      console.log('[GLOBAL] dblclick (capture)', {
        target: (e.target as HTMLElement | null)?.tagName,
        path,
        x: e.clientX,
        y: e.clientY,
      })
    }
    window.addEventListener('dblclick', handler, true)
    return () => window.removeEventListener('dblclick', handler, true)
  }, [])

  // BEHAVIOR: accept dblclick events relayed from iframe and reuse existing handler (via ref)
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data: any = ev.data
      if (!data || data.__app !== 'self-gen-app' || data.type !== 'iframe-dblclick' || data.pageId !== 'main') return

      // Translate iframe-local client coords to parent window client coords
      const iframe = document.querySelector('iframe') as HTMLIFrameElement | null
      const rect = iframe?.getBoundingClientRect()
      if (!rect) return
      const clientX = rect.left + (Number(data.x) || 0)
      const clientY = rect.top + (Number(data.y) || 0)

      // Synthesize a minimal event object with the fields our handler uses
      const synthetic: any = {
        type: 'dblclick',
        clientX,
        clientY,
        target: document.body,
        preventDefault() {},
        stopPropagation() {},
      }
      handleDoubleClickRef.current?.(synthetic as any)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // GLOBAL DIAGNOSTICS: capture all clicks in capture phase
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      console.log('[GLOBAL] click (capture)', {
        target: (e.target as HTMLElement | null)?.tagName,
        x: e.clientX,
        y: e.clientY,
      })
    }
    window.addEventListener('click', handler, true)
    return () => window.removeEventListener('click', handler, true)
  }, [])

  // ENV DIAGNOSTICS: inspect iframe and layering once on mount
  useEffect(() => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null
    if (iframe) {
      const cs = getComputedStyle(iframe)
      const rect = iframe.getBoundingClientRect()
      console.log('[ENV] iframe detected', {
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        opacity: cs.opacity,
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      })
    } else {
      console.log('[ENV] no iframe found at mount')
    }
  }, [])

  // IFRAME DIAGNOSTICS: try to hook dblclicks inside the iframe (same-origin only)
  useEffect(() => {
    let cleanup: (() => void) | null = null
    const attach = () => {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement | null
      if (!iframe) return
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) return
        const handler = (e: MouseEvent) => {
          console.log('[IFRAME] dblclick (capture)', {
            target: (e.target as HTMLElement | null)?.tagName,
            x: e.clientX,
            y: e.clientY,
          })
        }
        doc.addEventListener('dblclick', handler, true)
        console.log('[IFRAME] dblclick listener attached (capture)')
        cleanup = () => doc.removeEventListener('dblclick', handler, true)
      } catch (err) {
        console.warn('[IFRAME] Could not attach dblclick listener (likely cross-origin):', err)
      }
    }
    // attempt immediately and after load
    attach()
    const timer = setTimeout(attach, 500)
    return () => {
      clearTimeout(timer)
      cleanup?.()
    }
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // DIAGNOSTICS: log event target, coordinates, and container state
    console.log('[UI] dblclick detected', {
      type: e.type,
      targetTag: (e.target as HTMLElement)?.tagName,
      clientX: e.clientX,
      clientY: e.clientY,
    })

    // Skip when double-clicking within an existing textarea or an element opting out
    const el = e.target as HTMLElement | null
    if (el && (el.closest('textarea') || el.closest('[data-no-spawn="true"]'))) {
      console.log('[UI] dblclick ignored: inside textarea or no-spawn region')
      return
    }

    if (!typingComplete) setShowTyping(false)
    setHasTyped(true) // Hide TypingEffect immediately on interaction

    // compute position relative to the ContentWrapper container
    const target = containerRef.current
    const rect = target?.getBoundingClientRect()
    console.log('[UI] container rect', rect)
    if (!rect) {
      console.warn('[UI] No container rect; aborting create')
      return
    }
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    console.log('[UI] computed local coords', { x, y })

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    console.log(`[UI] Creating textarea node id=${id} at position x=${x}, y=${y}`)

    // Determine next orderIndex within parent 'root'
    const lastOrder = store.query({
      query: "SELECT COALESCE(MAX(orderIndex), -1) as maxOrder FROM nodes WHERE parentId = 'root'",
      bindValues: {},
    }) as { maxOrder: number }[]
    const orderIndex = (lastOrder[0]?.maxOrder ?? -1) + 1
    console.log('[UI] next orderIndex', orderIndex)

    // Create a generic UI node (textarea for now)
    console.log(`[UI] Committing uiNodeCreated event for id=${id}`)
    store.commit((events as any).uiNodeCreated({ id, tag: 'textarea', x, y, parentId: 'root', orderIndex, createdAt: Date.now() }))
  }, [typingComplete, store])

  // Keep ref updated with latest handler
  useEffect(() => {
    handleDoubleClickRef.current = handleDoubleClick
  }, [handleDoubleClick])

  const handleTypingComplete = () => {
    setTypingComplete(true);
  };

  // Reactive queries using queryDb + store.useQuery
  const nodes$ = queryDb(
    tables.nodes.where({ parentId: 'root' }).orderBy('orderIndex', 'asc'),
    { label: 'nodes$' }
  )
  const removalRows$ = queryDb(tables.nodeRemovalLog, { label: 'nodeRemovalLog$' })
  const readdRows$ = queryDb(tables.nodeReaddLog, { label: 'nodeReaddLog$' })

  const nodes = store.useQuery(nodes$)
  const removalRows = store.useQuery(removalRows$)
  const readdRows = store.useQuery(readdRows$)

  // DIAGNOSTICS: log query results
  console.log('[UI] Nodes query result:', nodes);
  console.log('[UI] Removal rows query result:', removalRows);
  console.log('[UI] Readd rows query result:', readdRows);

  const removedNodeIds = new Set(removalRows.map((r) => r.nodeId))
  const readdedNodeIds = new Set(readdRows.map((r) => r.nodeId))

  // Visible nodes = created nodes minus removed (unless re-added afterwards)
  const visibleNodes = nodes.filter((n) => !(removedNodeIds.has(n.id) && !readdedNodeIds.has(n.id)))
  
  // DIAGNOSTICS: log visible nodes
  console.log('[UI] Visible nodes:', visibleNodes);

  const lastVisibleNodeId = visibleNodes.at(-1)?.id
  const lastCurrentlyRemovedId = [...removalRows].reverse().find((r) => !readdedNodeIds.has(r.nodeId))?.nodeId
  const canUndo = !!lastVisibleNodeId
  const canRedo = !!lastCurrentlyRemovedId

  return (
    <AppContainer
      onClickCapture={(e) => {
        console.log('[UI] AppContainer click (capture)', {
          targetTag: (e.target as HTMLElement)?.tagName,
          x: e.clientX,
          y: e.clientY,
        })
      }}
      onDoubleClickCapture={handleDoubleClick}
    >
      <PolygonBackground />
  {/* Transparent overlay container (non-interactive). Stays below textareas (zIndex 2) & toolbar (zIndex 3). */}
  <GlobalOverlay zIndex={1} />
      <ContentWrapper
        ref={containerRef as any}
        onDoubleClickCapture={(e: React.MouseEvent) => {
          console.log('[UI] ContentWrapper dblclick (capture)', {
            targetTag: (e.target as HTMLElement)?.tagName,
            x: e.clientX,
            y: e.clientY,
          })
        }}
      >
        {showTyping && !hasTyped && (
          <TypingEffect
            text="double‑click anywhere to place a text area"
            speed={80}
            onComplete={handleTypingComplete}
          />
        )}
        {/* Toolbar (event-driven) */}
        {typingComplete && (
          <UndoRedoToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            undoNodeId={lastVisibleNodeId}
            redoNodeId={lastCurrentlyRemovedId}
            pageId="main"
            streamId="page:main"
            onThemeChange={onThemeChange}
            onToggleHideUnfocused={setHideUnfocused}
            onChatOpen={() => setClearIframe(true)}
          />
        )}

        {/* Render all visible nodes (currently textarea tag only) */}
        {visibleNodes.map((n) => {
          console.log('[UI] Rendering node', n);
          return n.tag === 'textarea' ? (
            <ClickTextArea
              key={n.id}
              visible={true}
              x={n.x}
              y={n.y}
              fontSizeRem={1.5}
              containerWidth={containerRef.current?.clientWidth}
              onFirstType={() => setHasTyped(true)}
              hideUnfocused={hideUnfocused}
            />
          ) : null
        })}
        {/* Streaming preview iframe as full-screen background layer */}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <IframeRenderer streamId="page:main" pageId="main" height={'100%'} clearIframe={clearIframe} />
        </Box>
        <ClickOverlay />
      </ContentWrapper>
    </AppContainer>
  );
};

export default MainContainer;