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
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { Database, isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  isConnected,
  getUseDb
} from 'shared/modules/connections/connectionsDuck'
import FrameTemplate from 'browser/modules/Frame/FrameTemplate'
import {
  StyledStatusBar,
  AutoRefreshToggle,
  AutoRefreshSpan,
  StatusbarWrapper
} from '../AutoRefresh/styled'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { hasMultiDbSupport } from 'shared/modules/features/versionedFeatures'
import { ErrorsView } from '../CypherFrame/ErrorsView'
import { getDatabases } from 'shared/modules/dbMeta/dbMetaDuck'
import * as legacyHelpers from './legacyHelpers'
import * as helpers from './helpers'
import { SysInfoTable } from './SysInfoTable'
import { Bus } from 'suber'
import { GlobalState } from 'shared/globalState'
import { Frame } from 'shared/modules/frames/framesDuck'
import { ExclamationTriangleIcon } from '../../../components/icons/Icons'
import { InlineError } from './styled'

export type DatabaseMetric = { label: string; value?: string }
export type SysInfoFrameState = {
  lastFetch?: null | number
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
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
    } else if (!hasMultiDbSupport) {
      this.runCypherQuery(
        legacyHelpers.sysinfoQuery(),
        legacyHelpers.responseHandler(this.setState.bind(this))
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
      transactions
    } = this.state
    const {
      databases,
      frame,
      isConnected,
      isEnterprise,
      hasMultiDbSupport
    } = this.props

    const content = isConnected ? (
      <SysInfoTable
        pageCache={pageCache}
        storeSizes={storeSizes}
        idAllocation={idAllocation}
        transactions={transactions}
        databases={databases}
        isEnterpriseEdition={isEnterprise}
        hasMultiDbSupport={hasMultiDbSupport}
      />
    ) : (
      <ErrorsView
        result={{ code: 'No connection', message: 'No connection available' }}
      />
    )

    return (
      <FrameTemplate
        header={frame}
        contents={content}
        statusbar={
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

const mapStateToProps = (state: GlobalState) => ({
  hasMultiDbSupport: hasMultiDbSupport(state),
  isEnterprise: isEnterprise(state),
  isConnected: isConnected(state),
  databases: getDatabases(state),
  useDb: getUseDb(state)
})

export default withBus(connect(mapStateToProps)(SysInfoFrame))
