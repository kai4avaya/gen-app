import React, { useState, useEffect } from 'react'
import { Box, Modal, Typography, Switch, FormControlLabel, TextField, Checkbox, Stack, Divider } from '@mui/material'

export type SettingsModalProps = {
  open: boolean
  onClose: () => void
  onThemeChange?: (isDark: boolean) => void
}

type Settings = {
  isDarkMode: boolean
  openRouterKey: string
  modelName: string
  saveLocally: boolean
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, onThemeChange }) => {
  const [settings, setSettings] = useState<Settings>({
    isDarkMode: false,
    openRouterKey: '',
    modelName: '',
    saveLocally: false
  })

  useEffect(() => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      const parsed = JSON.parse(saved)
      setSettings(parsed)
      onThemeChange?.(parsed.isDarkMode)
    }
  }, [onThemeChange])

  const handleChange = (field: keyof Settings, value: boolean | string) => {
    const newSettings = { ...settings, [field]: value }
    setSettings(newSettings)
    
    if (field === 'isDarkMode') {
      onThemeChange?.(value as boolean)
    }
    
    if (newSettings.saveLocally) {
      localStorage.setItem('app-settings', JSON.stringify(newSettings))
    } else {
      localStorage.removeItem('app-settings')
    }
  }

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
          maxWidth: 500
        })}
      >
        <Typography variant="h6" sx={(theme) => ({ mb: 3, color: theme.palette.text.primary, fontWeight: 300 })}>
          Settings
        </Typography>
        
        <Stack spacing={3}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.isDarkMode}
                onChange={(e) => handleChange('isDarkMode', e.target.checked)}
              />
            }
            label={<Typography sx={(theme) => ({ color: theme.palette.text.primary })}>Dark Mode</Typography>}
          />
          
          <Divider />
          
          <TextField
            label="OpenRouter API Key"
            type="password"
            value={settings.openRouterKey}
            onChange={(e) => handleChange('openRouterKey', e.target.value)}
            size="small"
            fullWidth
          />
          
          <TextField
            label="Model Name"
            value={settings.modelName}
            onChange={(e) => handleChange('modelName', e.target.value)}
            size="small"
            fullWidth
            placeholder="e.g., gpt-4"
          />
          
          <Divider />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.saveLocally}
                onChange={(e) => handleChange('saveLocally', e.target.checked)}
              />
            }
            label={<Typography sx={(theme) => ({ color: theme.palette.text.primary })}>Personal computer, save my choices</Typography>}
          />
        </Stack>
      </Box>
    </Modal>
  )
}

export default SettingsModal