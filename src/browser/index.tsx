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
import ReactDOM from 'react-dom'

import AppInit, { setupSentry } from './AppInit'
import './init'
import { navigateToPreview } from './modules/Stream/StartPreviewFrame'
import { optedInByRegion } from './services/preview-optin-service'

setupSentry()

;(async () => {
  const optedInToPreview = optedInByRegion()
  try {
    const response = await fetch('./preview/manifest.json')
    if (response.status === 200) {
      if (optedInToPreview) {
        navigateToPreview()
      } else {
        localStorage.setItem('previewAvailable', 'true')
      }
    } else {
      localStorage.setItem('previewAvailable', 'false')
    }
  } catch (e) {
    localStorage.setItem('previewAvailable', 'false')
  }

  ReactDOM.render(<AppInit />, document.getElementById('mount'))
})()
