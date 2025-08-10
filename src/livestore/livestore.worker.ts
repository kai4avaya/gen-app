import './dev-base'
// Polyfill for Vite dev worker env (no-op in build)
import '@livestore/adapter-web/worker-vite-dev-polyfill'
import { makeWorker } from '@livestore/adapter-web/worker'
import { schema } from './schema'

// Leader worker entry for LiveStore (runs in a Web Worker)
makeWorker({ schema })
