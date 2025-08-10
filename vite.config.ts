import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { livestoreDevtoolsPlugin } from '@livestore/devtools-vite'

// LiveStore note: exclude wa-sqlite per adapter-web readme until upstream Vite bug fixed
export default defineConfig({
  plugins: [
    react(),
    livestoreDevtoolsPlugin({ schemaPath: './src/livestore/schema.ts' }),
  ],
  optimizeDeps: { exclude: ['@livestore/wa-sqlite'] },
})
