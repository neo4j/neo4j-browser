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

import { ExclamationTriangleIcon } from '../../../components/icons/Icons'
import {
  AutoRefreshSpan,
  AutoRefreshToggle,
  StatusbarWrapper,
  StyledStatusBar
} from '../AutoRefresh/styled'
import { ErrorsView } from '../CypherFrame/ErrorsView'
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
  isEnterprise
} from 'shared/modules/dbMeta/state'
import { canCallDbmsClusterOverview } from 'shared/modules/features/featuresDuck'
import { hasMultiDbSupport } from 'shared/modules/features/versionedFeatures'
import { Frame } from 'shared/modules/frames/framesDuck'

export type DatabaseMetric = { label: string; value?: string }
export type SysInfoFrameState = {
  lastFetch?: null | number
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
  casualClusterMembers: DatabaseMetric[]
  errorMessage: string | null
  results: boolean
  autoRefresh: boolean
  autoRefreshInterval: number
  namespacesEnabled: boolean
  userConfiguredPrefix: string
}

type SysInfoFrameProps = {
  bus: Bus
  databases: Database[]
  frame: Frame
  hasMultiDbSupport: boolean
  isConnected: boolean
  isEnterprise: boolean
  useDb: string | null
  isFullscreen: boolean
  isCollapsed: boolean
  canCallClusterOverview: boolean
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
    casualClusterMembers: [],
    errorMessage: null,
    results: false,
    autoRefresh: false,
    autoRefreshInterval: 20, // seconds
    namespacesEnabled: false,
    userConfiguredPrefix: 'neo4j'
  }

  componentDidMount(): void {
    this.getSettings()
      .then(this.getSysInfo)
      .catch(errorMessage => this.setState({ errorMessage }))
  }

  getSettings = (): Promise<void> =>
    new Promise((resolve, reject) => {
      const { bus, isConnected } = this.props

      if (bus && isConnected) {
        bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.listConfig("metrics.")',
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          ({ success, result }) => {
            if (success) {
              const newState = result.records.reduce(
                (newState: Partial<SysInfoFrameState>, record: any) => {
                  const name = record.get('name')
                  const value = record.get('value')
                  if (name === 'metrics.prefix') {
                    return { ...newState, userConfiguredPrefix: value }
                  }

                  if (name === 'metrics.namespaces.enabled') {
                    return { ...newState, namespacesEnabled: value === 'true' }
                  }

                  return newState
                },
                {}
              )

              this.setState(newState)
              resolve()
            } else {
              reject('Failed to run listConfig')
            }
          }
        )
      } else {
        reject('Could not reach server')
      }
    })

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

    if (prevProps.useDb !== this.props.useDb) {
      this.getSysInfo()
    }
  }

  getSysInfo = (): void => {
    const { userConfiguredPrefix, namespacesEnabled } = this.state
    const { useDb, hasMultiDbSupport } = this.props

    if (hasMultiDbSupport && useDb) {
      this.runCypherQuery(
        helpers.sysinfoQuery({
          databaseName: useDb,
          namespacesEnabled,
          userConfiguredPrefix
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
      if (this.props.canCallClusterOverview) {
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
      casualClusterMembers
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
        casualClusterMembers={casualClusterMembers}
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
    return (
      <LegacySysInfoFrame
        {...props}
        isACausalCluster={props.canCallClusterOverview}
      />
    )
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
  canCallClusterOverview: canCallDbmsClusterOverview(state)
})

export default withBus(connect(mapStateToProps)(FrameVersionPicker))
