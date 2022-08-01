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
import React, { Component } from 'react'
import { Bus } from 'suber'

import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../../AutoRefresh/styled'
import { ErrorsView } from '../../CypherFrame/ErrorsView/ErrorsView'
import { SysInfoDisplay } from './SysInfoDisplay'
import * as legacyHelpers from './sysinfoHelpers'
import FrameBodyTemplate from 'browser/modules/Frame/FrameBodyTemplate'
import FrameError from 'browser/modules/Frame/FrameError'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { Frame } from 'shared/modules/frames/framesDuck'

type LegacySysInfoFrameState = {
  lastFetch: null | number
  cc: any[]
  ha: any[]
  haInstances: any[]
  storeSizes: any[]
  idAllocation: any[]
  pageCache: any[]
  transactions: any[]
  error: string
  results: any
  success: any
  autoRefresh: boolean
  autoRefreshInterval: number
}
type LegacySysInfoProps = {
  bus: Bus
  frame: Frame
  isConnected: boolean
  isFullscreen: boolean
  isCollapsed: boolean
  isOnCluster: boolean
}

export class LegacySysInfoFrame extends Component<
  LegacySysInfoProps,
  LegacySysInfoFrameState
> {
  timer: number | undefined
  constructor(props: LegacySysInfoProps) {
    super(props)
    this.state = {
      lastFetch: null,
      cc: [],
      ha: [],
      haInstances: [],
      storeSizes: [],
      idAllocation: [],
      pageCache: [],
      transactions: [],
      error: '',
      results: false,
      success: null,
      autoRefresh: false,
      autoRefreshInterval: 20 // seconds
    }
  }

  componentDidMount(): void {
    this.getSysInfo()
  }

  componentDidUpdate(
    prevProps: LegacySysInfoProps,
    prevState: LegacySysInfoFrameState
  ): void {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(
          this.getSysInfo.bind(this),
          this.state.autoRefreshInterval * 1000
        )
      } else {
        clearInterval(this.timer)
      }
    }
    if (
      this.props.frame &&
      this.props.frame.ts !== prevProps.frame.ts &&
      this.props.frame.isRerun
    ) {
      this.getSysInfo()
    }
  }

  getSysInfo(): void {
    if (this.props.bus && this.props.isConnected) {
      this.setState({ lastFetch: Date.now() })
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: legacyHelpers.sysinfoQuery(),
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        legacyHelpers.responseHandler(this.setState.bind(this))
      )
      if (this.props.isOnCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview',
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          legacyHelpers.clusterResponseHandler(this.setState.bind(this))
        )
      }
    } else {
      this.setState({ error: 'No connection available' })
    }
  }

  setAutoRefresh(autoRefresh: boolean): void {
    this.setState({ autoRefresh })

    if (autoRefresh) {
      this.getSysInfo()
    }
  }

  render(): JSX.Element {
    const { isFullscreen, isCollapsed, isConnected, isOnCluster } = this.props
    const { error, success, lastFetch, autoRefresh } = this.state

    const content = isConnected ? (
      <SysInfoDisplay {...this.state} isOnCluster={isOnCluster} />
    ) : (
      <ErrorsView
        result={{ code: 'No connection', message: 'No connection available' }}
      />
    )

    return (
      <FrameBodyTemplate
        isCollapsed={isCollapsed}
        isFullscreen={isFullscreen}
        contents={content}
        statusBar={
          <StatusbarWrapper>
            {error ? <FrameError message={error} /> : null}
            {success ? (
              <StyledStatusBar>
                {lastFetch && `Updated: ${new Date(lastFetch).toISOString()}`}
                {success}
                <AutoRefreshSpan>
                  <AutoRefreshToggle
                    checked={autoRefresh}
                    onChange={(e: any) => this.setAutoRefresh(e.target.checked)}
                  />
                </AutoRefreshSpan>
              </StyledStatusBar>
            ) : null}
          </StatusbarWrapper>
        }
      />
    )
  }
}

export default LegacySysInfoFrame
