import './livestore/dev-base'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'
import App from './App.tsx'
import './index.css'
import { LiveStoreProvider } from '@livestore/react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { schema } from './livestore/schema'
import LiveStoreWorker from './livestore/livestore.worker?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'

// Initialize LiveStore adapter
// Use OPFS for storage (required by adapter); set a stable directory name.
// Ensure the dev base URL is well-formed for worker fetches in Vite dev.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
console.log("Dev base URL:", (window as any).__livestoreDevBase)
;(window as any).__livestoreDevBase = (window as any).__livestoreDevBase || `${location.origin}/`
const adapter = (makePersistedAdapter as any)({
  storage: { type: 'opfs', directory: 'livestore-v2' },
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
})
// Blinking cursor loading UI (matches TypingEffect size in MainContainer)
const BlinkingCursor = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    background: 'transparent',
  }}>
    <span style={{
      fontSize: '1.5rem', // match TypingEffect font size of 1.5rem
      fontFamily: 'monospace',
      lineHeight: 1,
      animation: 'blink 1s steps(1) infinite',
      color: '#222', // matches default text color
      userSelect: 'none',
    }}>
      |
    </span>
    <style>{`
      @keyframes blink {
        0%, 50% { opacity: 1; }
        50.01%, 100% { opacity: 0; }
      }
    `}</style>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LiveStoreProvider
      adapter={adapter}
      schema={schema}
      storeId="default-v2"
      batchUpdates={batchUpdates}
      renderLoading={() => <BlinkingCursor />}
    >
      <App />
    </LiveStoreProvider>
  </React.StrictMode>,
)
