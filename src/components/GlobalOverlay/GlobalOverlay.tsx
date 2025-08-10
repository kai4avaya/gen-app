import React from 'react'
import { Box } from '@mui/material'

export type GlobalOverlayProps = {
  children?: React.ReactNode
  dim?: boolean
  dimColor?: string
  zIndex?: number
  style?: React.CSSProperties
}

// A transparent, full-viewport overlay container for future UI (non-interactive)
// Sits below textareas (zIndex 2) and the undo/redo toolbar (zIndex 3)
const GlobalOverlay: React.FC<GlobalOverlayProps> = ({
  children,
  dim = false,
  dimColor = 'rgba(0,0,0,0.0)',
  zIndex = 1,
  style,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        pointerEvents: 'none', // ensure it does not intercept clicks
        background: dim ? dimColor : 'transparent',
        // Allow custom styles while preserving base behaviour
        ...style,
      }}
    >
      {children}
    </Box>
  )
}

export default GlobalOverlay
