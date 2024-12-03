/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'browser-components': resolve(__dirname, 'src/browser/components'),
      'browser-hooks': resolve(__dirname, 'src/browser/hooks'),
      'browser-services': resolve(__dirname, 'src/browser/services'),
      'browser-styles': resolve(__dirname, 'src/browser/styles'),
      'shared': resolve(__dirname, 'src/shared'),
      'services': resolve(__dirname, 'src/shared/services'),
      'browser': resolve(__dirname, 'src/browser'),
      '@neo4j-cypher/editor-support': resolve(__dirname, 'src/cypher-editor-support'),
      'project-root': resolve(__dirname, '.'),
      'neo4j-arc/common': resolve(__dirname, 'src/neo4j-arc/common')
    }
  },
  optimizeDeps: {
    include: [
      'neo4j-driver',
      'lodash-es'
    ]
  },
  server: {
    port: 8080,
    hmr: false
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'd3': [
            'd3-force',
            'd3-drag',
            'd3-selection',
            'd3-zoom',
            'd3-shape',
            'd3-ease'
          ]
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'global': 'globalThis'
  }
}) 