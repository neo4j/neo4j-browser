/// <reference types="node" />
import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          '@babel/plugin-transform-regenerator'
        ]
      }
    })
  ],
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
      'project-root': resolve(__dirname, '.')
    }
  },
  server: {
    port: 8080,
    https: undefined,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'neo4j-driver': ['neo4j-driver'],
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
    'global': 'window'
  },
  worker: {
    format: 'es',
    plugins: () => []
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'neo4j-driver',
      'd3-force',
      'd3-drag',
      'd3-selection',
      'd3-zoom',
      'd3-shape',
      'd3-ease'
    ]
  }
}) 