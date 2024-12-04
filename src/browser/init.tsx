/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

// Import styles
import '@neo4j-ndl/base/lib/neo4j-ds-styles.css'
import 'tailwindcss/tailwind.css'
import './styles/app.css'

// Lazy load main app
const AppInit = React.lazy(() => import('./AppInit'))

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20">
      <h2 className="text-red-700 dark:text-red-300">Something went wrong:</h2>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary" />
    </div>
  )
}

export function mount(container: HTMLElement): void {
  const root = createRoot(container)
  root.render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<LoadingSpinner />}>
          <AppInit />
        </Suspense>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

// Mount React app
const container = document.getElementById('root')
if (container) {
  mount(container)
}

// Modern base64 polyfill
if (typeof window.btoa === 'undefined') {
  window.btoa = (str: string): string => {
    try {
      return window.btoa(unescape(encodeURIComponent(str)))
    } catch (e) {
      console.error('Base64 encoding failed:', e)
      return '' // Return empty string on error
    }
  }
}

// Type-safe worker
export const worker = new Worker(
  new URL('../shared/services/bolt/boltWorker.ts', import.meta.url),
  { 
    type: 'module',
    name: 'bolt-worker'
  }
) as Worker
