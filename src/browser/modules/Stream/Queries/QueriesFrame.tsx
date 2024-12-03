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
import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { useListQueriesQuery, useKillQueryMutation } from 'shared/services/neo4jApi'
import { CONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'
import { useVirtualizer } from '@tanstack/react-virtual'

import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import { GlobalState } from 'project-root/src/shared/globalState'
import {
  Code,
  StyledHeaderRow,
  StyledTable,
  StyledTableWrapper,
  StyledTd,
  StyledTh,
  VirtualTableBody
} from './styled'
import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../AutoRefresh/styled'
import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import FrameError from '../../Frame/FrameError'

type QueriesFrameState = {
  queries: any[]
  autoRefresh: boolean
  autoRefreshInterval: number
  successMessage: null | string
  errorMessages: string[]
}

type QueriesFrameProps = {
  frame?: Frame
  connectionState: number
  isFullscreen: boolean
  isCollapsed: boolean
}

export function QueriesFrame({
  frame,
  connectionState,
  isFullscreen,
  isCollapsed
}: QueriesFrameProps) {
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [autoRefreshInterval] = useState(20) // seconds
  const parentRef = React.useRef<HTMLDivElement>(null)

  const { 
    data: queries = [], 
    error, 
    refetch 
  } = useListQueriesQuery(undefined, {
    pollingInterval: autoRefresh ? autoRefreshInterval * 1000 : 0,
    skip: connectionState !== CONNECTED_STATE
  })

  const rowVirtualizer = useVirtualizer({
    count: queries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // estimated row height
    overscan: 10
  })

  const [killQuery] = useKillQueryMutation()

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    if (seconds > 0) return `${seconds}s`
    return `${milliseconds}ms`
  }

  const handleAutoRefreshChange = (newValue: boolean) => {
    setAutoRefresh(newValue)
    if (newValue) {
      refetch()
    }
  }

  const handleKillQuery = async (queryId: string) => {
    try {
      await killQuery({ queryId })
      refetch()
    } catch (err) {
      console.error('Failed to kill query:', err)
    }
  }

  if (error) {
    return (
      <FrameError
        frame={frame}
        message="Error: Unable to load queries"
        details={error.toString()}
      />
    )
  }

  return (
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={
        <>
          <StyledTableWrapper>
            <StyledTable>
              <thead>
                <StyledHeaderRow>
                  <StyledTh>Host</StyledTh>
                  <StyledTh>Query</StyledTh>
                  <StyledTh>Params</StyledTh>
                  <StyledTh>Meta</StyledTh>
                  <StyledTh>Kill Query</StyledTh>
                </StyledHeaderRow>
              </thead>
            </StyledTable>
            <VirtualTableBody ref={parentRef}>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative'
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const query = queries[virtualRow.index]
                  return (
                    <div
                      key={query.queryId}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`
                      }}
                    >
                      <div style={{ display: 'flex', padding: '8px' }}>
                        <div style={{ flex: '1' }} title={query.host}>
                          <Code>{query.host}</Code>
                        </div>
                        <div style={{ flex: '2' }} title={query.query}>
                          <Code>{query.query}</Code>
                        </div>
                        <div style={{ flex: '1' }} title={JSON.stringify(query.parameters, null, 2)}>
                          <Code>{JSON.stringify(query.parameters)}</Code>
                        </div>
                        <div style={{ flex: '1' }}>
                          {query.elapsedTimeMillis ? (
                            <Code>
                              Elapsed time: {formatDuration(query.elapsedTimeMillis)}
                            </Code>
                          ) : null}
                          {query.requestId ? (
                            <Code>Request id: {query.requestId}</Code>
                          ) : null}
                        </div>
                        <div style={{ width: '80px' }}>
                          <ConfirmationButton
                            onConfirmed={() => handleKillQuery(query.queryId)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </VirtualTableBody>
          </StyledTableWrapper>
          <StatusbarWrapper>
            <StyledStatusBar>
              <div>Found {queries.length} queries</div>
              <AutoRefreshSpan>
                <AutoRefreshToggle
                  checked={autoRefresh}
                  onChange={(e) => handleAutoRefreshChange(e.target.checked)}
                />
              </AutoRefreshSpan>
            </StyledStatusBar>
          </StatusbarWrapper>
        </>
      }
    />
  )
}

const mapStateToProps = (state: GlobalState) => ({
  connectionState: getConnectionState(state)
})

export default connect(mapStateToProps)(QueriesFrame)
