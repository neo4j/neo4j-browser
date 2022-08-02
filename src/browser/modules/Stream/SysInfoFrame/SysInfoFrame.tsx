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
import React, { Component, ReactNode } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Bus } from 'suber'

import { ExclamationTriangleIcon } from 'browser-components/icons/LegacyIcons'

import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../AutoRefresh/styled'
import { ErrorsView } from '../CypherFrame/ErrorsView/ErrorsView'
import LegacySysInfoFrame from './LegacySysInfoFrame/LegacySysInfoFrame'
import { SysInfoTable } from './SysInfoTable'
import { InlineError } from './styled'
import * as helpers from './sysinfoHelpers'
import FrameBodyTemplate from 'browser/modules/Frame/FrameBodyTemplate'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { GlobalState } from 'shared/globalState'
import {
  getUseDb,
  isConnected
} from 'shared/modules/connections/connectionsDuck'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  Database,
  getDatabases,
  getMetricsNamespacesEnabled,
  getMetricsPrefix,
  isEnterprise,
  isOnCluster
} from 'shared/modules/dbMeta/dbMetaDuck'
import { hasMultiDbSupport } from 'shared/modules/features/versionedFeatures'
import { Frame } from 'shared/modules/frames/framesDuck'

export type DatabaseMetric = { label: string; value?: string }
export type SysInfoFrameState = {
  lastFetch?: null | number
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
  clusterMembers: DatabaseMetric[]
  errorMessage: string | null
  results: boolean
  autoRefresh: boolean
  autoRefreshInterval: number
}

export type SysInfoFrameProps = {
  bus: Bus
  databases: Database[]
  frame: Frame
  hasMultiDbSupport: boolean
  isConnected: boolean
  isEnterprise: boolean
  useDb: string | null
  isFullscreen: boolean
  isCollapsed: boolean
  isOnCluster: boolean
  namespacesEnabled: boolean
  metricsPrefix: string
}

export class SysInfoFrame extends Component<
  SysInfoFrameProps,
  SysInfoFrameState
> {
  timer: number | null = null
  state: SysInfoFrameState = {
    lastFetch: null,
    storeSizes: [],
    idAllocation: [],
    pageCache: [],
    transactions: [],
    clusterMembers: [],
    errorMessage: null,
    results: false,
    autoRefresh: false,
    autoRefreshInterval: 20 // seconds
  }

  componentDidMount(): void {
    this.getSysInfo()
  }

  componentDidUpdate(
    prevProps: SysInfoFrameProps,
    prevState: SysInfoFrameState
  ): void {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(
          this.getSysInfo,
          this.state.autoRefreshInterval * 1000
        )
      } else {
        this.timer && clearInterval(this.timer)
      }
    }

    if (
      prevProps.useDb !== this.props.useDb ||
      prevProps.namespacesEnabled !== this.props.namespacesEnabled ||
      prevProps.metricsPrefix !== this.props.metricsPrefix
    ) {
      this.getSysInfo()
    }
  }

  getSysInfo = (): void => {
    const { useDb, hasMultiDbSupport, metricsPrefix, namespacesEnabled } =
      this.props

    if (hasMultiDbSupport && useDb) {
      this.runCypherQuery(
        helpers.sysinfoQuery({
          databaseName: useDb,
          namespacesEnabled,
          metricsPrefix
        }),
        helpers.responseHandler(this.setState.bind(this))
      )
    }
  }

  runCypherQuery = (
    query: string,
    responseHandler: (res: any) => void
  ): void => {
    const { bus, isConnected } = this.props
    if (bus && isConnected) {
      this.setState({ lastFetch: Date.now() })
      bus.self(
        CYPHER_REQUEST,
        {
          query,
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        responseHandler
      )
      if (this.props.isOnCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview',
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          helpers.clusterResponseHandler(this.setState.bind(this))
        )
      }
    }
  }

  setAutoRefresh = (autoRefresh: boolean): void => {
    this.setState({ autoRefresh })

    if (autoRefresh) {
      this.getSysInfo()
    }
  }

  render(): ReactNode {
    const {
      autoRefresh,
      errorMessage,
      idAllocation,
      lastFetch,
      pageCache,
      storeSizes,
      transactions,
      clusterMembers
    } = this.state
    const {
      databases,
      isConnected,
      isEnterprise,
      hasMultiDbSupport,
      isCollapsed,
      isFullscreen
    } = this.props

    const content = isConnected ? (
      <SysInfoTable
        pageCache={pageCache}
        storeSizes={storeSizes}
        idAllocation={idAllocation}
        transactions={transactions}
        databases={databases}
        clusterMembers={clusterMembers}
        isEnterpriseEdition={isEnterprise}
        hasMultiDbSupport={hasMultiDbSupport}
      />
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
            <StyledStatusBar>
              {lastFetch && `Updated: ${new Date(lastFetch).toISOString()}`}
              {errorMessage && (
                <InlineError>
                  <ExclamationTriangleIcon /> {errorMessage}
                </InlineError>
              )}
              <AutoRefreshSpan>
                <AutoRefreshToggle
                  checked={autoRefresh}
                  onChange={e => this.setAutoRefresh(e.target.checked)}
                />
              </AutoRefreshSpan>
            </StyledStatusBar>
          </StatusbarWrapper>
        }
      />
    )
  }
}
const FrameVersionPicker = (props: SysInfoFrameProps) => {
  if (props.isConnected && props.isEnterprise && !props.hasMultiDbSupport) {
    return <LegacySysInfoFrame {...props} isOnCluster={props.isOnCluster} />
  } else {
    return <SysInfoFrame {...props} />
  }
}

const mapStateToProps = (state: GlobalState) => ({
  hasMultiDbSupport: hasMultiDbSupport(state),
  isEnterprise: isEnterprise(state),
  isConnected: isConnected(state),
  databases: getDatabases(state),
  useDb: getUseDb(state),
  isOnCluster: isOnCluster(state),
  namespacesEnabled: getMetricsNamespacesEnabled(state),
  metricsPrefix: getMetricsPrefix(state)
})

export default withBus(connect(mapStateToProps)(FrameVersionPicker))
