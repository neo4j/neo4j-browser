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
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './components/ThemeProvider'
import AppInit from './AppInit'

// Import base styles
import './styles/app.css'
import './styles/bootstrap.grid-only.min.css'
import './styles/font-awesome.min.css'
import './styles/fira-code.css'
import './styles/neo4j-world.css'
import './styles/open-sans.css'
import './styles/inconsolata.css'

const container = document.getElementById('mount')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppInit />
    </ThemeProvider>
  </React.StrictMode>
)

// Type-safe worker
export const worker = new Worker(
  new URL('../shared/services/bolt/boltWorker.ts', import.meta.url),
  { 
    type: 'module',
    name: 'bolt-worker'
  }
) as Worker
