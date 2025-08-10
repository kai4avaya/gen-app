import React from 'react'
import { Box, Modal, Typography } from '@mui/material'

export type ChatModalProps = {
  open: boolean
  onClose: () => void
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={(theme) => ({
          background: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
          borderRadius: 2,
          p: 3,
          boxShadow: 3,
          backdropFilter: 'blur(8px)',
          minWidth: 400,
          maxWidth: 600,
          maxHeight: '80vh'
        })}
      >
        <Typography variant="h6" sx={(theme) => ({ mb: 2, color: theme.palette.text.primary, fontWeight: 300 })}>
          Chat
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Chat interface coming soon...
        </Typography>
      </Box>
    </Modal>
  )
}

export default ChatModal