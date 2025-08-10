import React, { useState } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useStore } from '@livestore/react'
import { events } from '../../livestore/schema'
import SettingsModal from '../SettingsModal/SettingsModal'
import ChatModal from '../ChatModal/ChatModal'

export type UndoRedoToolbarProps = {
  canUndo: boolean
  canRedo: boolean
  undoNodeId?: string
  redoNodeId?: string
  onThemeChange?: (isDark: boolean) => void
  onToggleHideUnfocused?: (hide: boolean) => void
}

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({ canUndo, canRedo, undoNodeId, redoNodeId, onThemeChange, onToggleHideUnfocused }) => {
  const { store } = useStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [hideUnfocused, setHideUnfocused] = useState(false)

  return (
    <>
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={(theme) => ({
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 0.5,
        zIndex: 3,
        background: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.6)',
        borderRadius: 1,
        p: 0.5,
        boxShadow: 1,
        backdropFilter: 'blur(4px)'
      })}
    >
      <Tooltip title="Undo">
        <span>
          <IconButton
            size="small"
            disabled={!canUndo || !undoNodeId}
            onClick={() => {
              console.log(`Undo clicked: removing node id=${undoNodeId}`)
              if (!undoNodeId) return
              store.commit((events as any).uiNodeRemoved({ id: undoNodeId, timestamp: Date.now() }))
            }}
            sx={(theme) => ({ color: theme.palette.text.primary })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5a7 7 0 1 1-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M5 12H2m3 0-3-3m3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo">
        <span>
          <IconButton
            size="small"
            disabled={!canRedo || !redoNodeId}
            onClick={() => {
              console.log(`Redo clicked: re-adding node id=${redoNodeId}`)
              if (!redoNodeId) return
              store.commit((events as any).uiNodeReadded({ id: redoNodeId, timestamp: Date.now() }))
            }}
            sx={(theme) => ({ color: theme.palette.text.primary })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5a7 7 0 1 1-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M19 12h3m-3 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={hideUnfocused ? "Show all text areas" : "Hide unfocused text areas"}>
        <IconButton
          size="small"
          onClick={() => {
            const newHide = !hideUnfocused
            setHideUnfocused(newHide)
            onToggleHideUnfocused?.(newHide)
          }}
          sx={(theme) => ({ color: theme.palette.text.primary })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {hideUnfocused ? (
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></>
            )}
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Chat">
        <IconButton
          size="small"
          onClick={() => setChatOpen(true)}
          sx={(theme) => ({ color: theme.palette.text.primary })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </IconButton>
      </Tooltip>
      <Tooltip title="Settings">
        <IconButton
          size="small"
          onClick={() => setSettingsOpen(true)}
          sx={(theme) => ({ color: theme.palette.text.primary })}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </IconButton>
      </Tooltip>
    </Box>

    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} onThemeChange={onThemeChange} />
    <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}

export default UndoRedoToolbar
