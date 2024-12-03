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
import React, { useCallback, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useListQueriesQuery, useKillQueryMutation } from 'shared/services/neo4jApi'
import { CONNECTED_STATE } from 'shared/modules/connections/connectionsDuck'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualItem } from '@tanstack/react-virtual'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'
import { RootState } from 'shared/store/configureStore'
import {
  Code,
  StyledHeaderRow,
  StyledTable,
  StyledTableWrapper,
  StyledTh,
  VirtualTableBody,
  VirtualRow,
  VirtualCell,
  MetaInfo
} from './styled'
import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../AutoRefresh/styled'
import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import FrameError from '../../Frame/FrameError'

interface QueriesFrameProps {
  isFullscreen: boolean
  isCollapsed: boolean
}

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

export function QueriesFrame({ isFullscreen, isCollapsed }: QueriesFrameProps) {
  const [autoRefresh, setAutoRefresh] = React.useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const connectionState = useSelector((state: RootState) => state.connections.connectionState)

  const { 
    data: queries = [], 
    error, 
    refetch 
  } = useListQueriesQuery(undefined, {
    pollingInterval: autoRefresh ? 20000 : 0,
    skip: connectionState !== CONNECTED_STATE
  })

  const [killQuery] = useKillQueryMutation()

  const rowVirtualizer = useVirtualizer({
    count: queries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
    paddingStart: 8,
    paddingEnd: 8
  })

  const handleAutoRefreshChange = useCallback((newValue: boolean) => {
    setAutoRefresh(newValue)
    if (newValue) {
      refetch()
    }
  }, [refetch])

  const handleKillQuery = useCallback(async (queryId: string) => {
    try {
      await killQuery({ queryId })
      refetch()
    } catch (err) {
      console.error('Failed to kill query:', err)
    }
  }, [killQuery, refetch])

  const virtualRows = useMemo(() => 
    rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
      const query = queries[virtualRow.index]
      return (
        <div
          key={virtualRow.key}
          data-index={virtualRow.index}
          ref={rowVirtualizer.measureElement}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`
          }}
        >
          <VirtualRow isEven={virtualRow.index % 2 === 0}>
            <VirtualCell width="15%">
              <Code title={query.host}>{query.host}</Code>
            </VirtualCell>
            <VirtualCell width="35%">
              <Code title={query.query}>{query.query}</Code>
            </VirtualCell>
            <VirtualCell width="20%">
              <Code title={JSON.stringify(query.parameters, null, 2)}>
                {JSON.stringify(query.parameters)}
              </Code>
            </VirtualCell>
            <VirtualCell width="20%">
              <MetaInfo>
                {query.elapsedTimeMillis && (
                  <Code>
                    Elapsed: {formatDuration(query.elapsedTimeMillis)}
                  </Code>
                )}
                {query.requestId && (
                  <Code>ID: {query.requestId}</Code>
                )}
              </MetaInfo>
            </VirtualCell>
            <VirtualCell width="10%">
              <ConfirmationButton
                onConfirmed={() => handleKillQuery(query.queryId)}
              />
            </VirtualCell>
          </VirtualRow>
        </div>
      )
    }), [rowVirtualizer, queries, handleKillQuery])

  if (error) {
    return (
      <FrameError
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
                  <StyledTh width="15%">Host</StyledTh>
                  <StyledTh width="35%">Query</StyledTh>
                  <StyledTh width="20%">Params</StyledTh>
                  <StyledTh width="20%">Meta</StyledTh>
                  <StyledTh width="10%">Kill Query</StyledTh>
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
                {virtualRows}
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

export default QueriesFrame
