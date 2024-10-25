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
import React, { useRef } from 'react'
import { isRunningE2ETest } from 'services/utils'
import { TelemetrySettings } from 'shared/utils/selectors'
import { MetricsData } from '../Segment'

export const navigateToPreview = (): void => {
  const path = window.location.pathname
  if (!path.endsWith('/preview/')) {
    window.location.pathname = `${path}${path.endsWith('/') ? '' : '/'}preview/`
  }
}

const useTrackAndNavigateToPreview = (
  telemetrySettings: TelemetrySettings
): (() => void) => {
  const segmentTrackCallback = useRef((_: MetricsData) => _)
  const path = window.location.pathname

  return () => {
    if (!path.endsWith('/preview/')) {
      if (!isRunningE2ETest() && telemetrySettings.allowUserStats) {
        const now = Date.now()
        localStorage.setItem('hasTriedPreviewUI', 'true')

        const timeSinceLastSwitchMs =
          localStorage.getItem('timeSinceLastSwitchMs') ?? null
        localStorage.setItem('timeSinceLastSwitchMs', now.toString())

        let timeSinceLastSwitch = null
        if (timeSinceLastSwitchMs !== null) {
          timeSinceLastSwitch = now - parseInt(timeSinceLastSwitchMs)
        }

        segmentTrackCallback &&
          segmentTrackCallback.current &&
          segmentTrackCallback.current({
            category: 'preview',
            label: 'PREVIEW_UI_SWITCH',
            data: {
              switchedTo: 'preview',
              timeSinceLastSwitch: timeSinceLastSwitch ?? 0
            }
          })
      }

      navigateToPreview()
    }
  }
}

type PreviewFrameProps = {
  telemetrySettings: TelemetrySettings
}
export const PreviewFrame = ({ telemetrySettings }: PreviewFrameProps) => {
  const trackAndNavigateToPreview =
    useTrackAndNavigateToPreview(telemetrySettings)

  return (
    <>
      <div className="teasers">
        <div className="teaser teaser-advertise teaser-3">
          <img src="./assets/images/clusters.svg" className="img-advertise" />
          <h3>🚀 Try the new Browser preview!</h3>
          <p>
            Switch to the preview experience to access all the latest features.
          </p>
          <button
            onClick={trackAndNavigateToPreview}
            className="btn btn-advertise"
          >
            {"Let's go"}
          </button>
        </div>

        <div className="teaser teaser-3">
          <h3>Try Neo4j with live data</h3>
          <p className="lead">
            A complete example graph that demonstrates common query patterns.
          </p>
          <div className="icon-holder">
            <p>Actors & movies in cross-referenced pop culture.</p>
            <div className="clearfix" />
          </div>
          <button exec-topic="guide movie-graph" className="btn btn-cta">
            Open guide
          </button>
        </div>
        <div className="teaser teaser-3">
          <h3>Cypher basics</h3>
          <p className="lead">Intro to Graphs with Cypher </p>

          <ul className="topic-bullets">
            <li>What is a graph database?</li>
            <li>How can I query a graph?</li>
          </ul>
          <div className="clearfix" />
          <button exec-topic="guide cypher" className="btn btn-cta">
            Start querying
          </button>
        </div>
      </div>
      <footer className="tight">
        <p className="text-muted">
          Copyright &copy;
          <a
            target="_blank"
            rel="noreferrer"
            href="http://neo4j.com/"
            className="no-icon"
          >
            {' '}
            Neo4j, Inc
          </a>
          &nbsp;<span>2002–{new Date().getFullYear()}</span>
        </p>
      </footer>
    </>
  )
}
