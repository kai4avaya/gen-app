import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  cursor: 'text'
});

export type MainContainerProps = {
  onThemeChange?: (isDark: boolean) => void
}

const MainContainer: React.FC<MainContainerProps> = ({ onThemeChange }) => {
  const [showTyping, setShowTyping] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); // session-only
  const [hideUnfocused, setHideUnfocused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { store } = useStore()

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!typingComplete) setShowTyping(false)
    setHasTyped(true) // Hide TypingEffect immediately on click
    // compute position relative to the ContentWrapper container
    const target = containerRef.current
    const rect = target?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    console.log(`Creating textarea node id=${id} at position x=${x}, y=${y}`)
    // Determine next orderIndex within parent 'root'
    const lastOrder = store.query({
      query: "SELECT COALESCE(MAX(orderIndex), -1) as maxOrder FROM nodes WHERE parentId = 'root'",
      bindValues: {},
    }) as { maxOrder: number }[]
    const orderIndex = (lastOrder[0]?.maxOrder ?? -1) + 1
    // Create a generic UI node (textarea for now)
    console.log(`Committing uiNodeCreated event for id=${id}`)
    store.commit((events as any).uiNodeCreated({ id, tag: 'textarea', x, y, parentId: 'root', orderIndex, createdAt: Date.now() }))
  }, [typingComplete, store])

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

  const removedNodeIds = new Set(removalRows.map((r) => r.nodeId))
  const readdedNodeIds = new Set(readdRows.map((r) => r.nodeId))

  // Visible nodes = created nodes minus removed (unless re-added afterwards)
  const visibleNodes = nodes.filter((n) => !(removedNodeIds.has(n.id) && !readdedNodeIds.has(n.id)))

  const lastVisibleNodeId = visibleNodes.at(-1)?.id
  const lastCurrentlyRemovedId = [...removalRows].reverse().find((r) => !readdedNodeIds.has(r.nodeId))?.nodeId
  const canUndo = !!lastVisibleNodeId
  const canRedo = !!lastCurrentlyRemovedId

  return (
    <AppContainer>
      <PolygonBackground />
  {/* Transparent overlay container (non-interactive). Stays below textareas (zIndex 2) & toolbar (zIndex 3). */}
  <GlobalOverlay zIndex={1} />
      <ContentWrapper ref={containerRef as any} onClick={handleClick}>
        {showTyping && !hasTyped && (
          <TypingEffect
            text="click anywhere and start typing"
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
            onThemeChange={onThemeChange}
            onToggleHideUnfocused={setHideUnfocused}
          />
        )}

        {/* Render all visible nodes (currently textarea tag only) */}
        {visibleNodes.map((n) => (
          n.tag === 'textarea' ? (
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
        ))}
        {/* Streaming preview iframe as full-screen background layer */}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <IframeRenderer streamId="page:main" pageId="main" height={'100%'} />
        </Box>
        <ClickOverlay />
      </ContentWrapper>
    </AppContainer>
  );
};

export default MainContainer;