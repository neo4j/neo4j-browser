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
import FrameError from 'browser/modules/Frame/FrameError'
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
import { Frame } from 'shared/modules/stream/streamDuck'
import { ExclamationTriangleIcon } from '../../../components/icons/Icons'
import styled from 'styled-components'

export type DatabaseMetric = { label: string; value?: string }
export type SysInfoFrameState = {
  lastFetch?: null | number
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
  errorMessage: string | null
  results: boolean
  success: boolean
  autoRefresh: boolean
  autoRefreshInterval: number
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
    success: false,
    autoRefresh: false,
    autoRefreshInterval: 20 // seconds
  }
  metricsSettings?: {
    namespacesEnabled: boolean
    userConfiguredPrefix: string
    jmxDisabled: boolean
    metricsDisabled: boolean
  }

  componentDidMount(): void {
    this.getSettings().then(this.getSysInfo.bind(this))
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
              result.records.forEach((record: any) => {
                const name = record.get('name')
                const value = record.get('value')
                //if(name === "metrics.prefix")
                //namespacesEnabled
                //userConfiguredPrefix
                //console.log(name, value)
                resolve()
              })
            } else {
              this.setState({ success: false })
              reject()
            }
          }
        )
      } else {
        this.setState({ success: false })
        reject()
      }
    })

  componentDidUpdate(
    prevProps: SysInfoFrameProps,
    prevState: SysInfoFrameState
  ): void {
    if (prevState.autoRefresh !== this.state.autoRefresh) {
      if (this.state.autoRefresh) {
        this.timer = setInterval(
          this.getSysInfo.bind(this),
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

  getSysInfo(): void {
    const { bus, isConnected, useDb } = this.props
    const { sysinfoQuery, responseHandler } = this.props.hasMultiDbSupport
      ? helpers
      : legacyHelpers

    if (bus && isConnected && useDb) {
      this.setState({ lastFetch: Date.now() })
      bus.self(
        CYPHER_REQUEST,
        {
          query: sysinfoQuery({
            databaseName: useDb,
            namespacesEnabled: false,
            userConfiguredPrefix: 'neo4j'
          }),
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        responseHandler(this.setState.bind(this))
      )
    }
  }

  setAutoRefresh(autoRefresh: boolean): void {
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
      success,
      transactions
    } = this.state
    const { databases, frame, isConnected, isEnterprise } = this.props

    const content =
      !isConnected && success ? (
        <ErrorsView
          result={{ code: 'No connection', message: 'No connection available' }}
        />
      ) : (
        <SysInfoTable
          pageCache={pageCache}
          storeSizes={storeSizes}
          idAllocation={idAllocation}
          transactions={transactions}
          databases={databases}
          isEnterpriseEdition={isEnterprise}
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

const InlineError = styled.span`
  color: ${props => props.theme.error};
  padding-left: 15px;
`

const mapStateToProps = (state: GlobalState) => ({
  hasMultiDbSupport: hasMultiDbSupport(state),
  isEnterprise: isEnterprise(state),
  isConnected: isConnected(state),
  databases: getDatabases(state),
  useDb: getUseDb(state)
})

export default withBus(connect(mapStateToProps)(SysInfoFrame))
