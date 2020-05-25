/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import dateFormat from 'dateformat'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { isACausalCluster } from 'shared/modules/features/featuresDuck'
import {
  isConnected,
  getUseDb
} from 'shared/modules/connections/connectionsDuck'
import FrameTemplate from 'browser/modules/Frame/FrameTemplate'
import FrameError from 'browser/modules/Frame/FrameError'
import Render from 'browser-components/Render'
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

export class SysInfoFrame extends Component {
  constructor(props) {
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
    this.helpers = this.props.hasMultiDbSupport ? helpers : legacyHelpers
  }

  componentDidMount() {
    this.getSysInfo()
  }

  componentDidUpdate(prevProps, prevState) {
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

  getSysInfo() {
    if (this.props.bus && this.props.isConnected) {
      this.setState({ lastFetch: Date.now() })
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: this.helpers.sysinfoQuery(this.props.useDb),
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        this.helpers.responseHandler(this.setState.bind(this), this.props.useDb)
      )
      if (this.props.isACausalCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview',
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          this.helpers.clusterResponseHandler(this.setState.bind(this))
        )
      }
    } else {
      this.setState({ error: 'No connection available' })
    }
  }

  setAutoRefresh(autoRefresh) {
    this.setState({ autoRefresh: autoRefresh })

    if (autoRefresh) {
      this.getSysInfo()
    }
  }

  render() {
    const SysinfoComponent = this.helpers.Sysinfo
    const content = !this.props.isConnected ? (
      <ErrorsView
        result={{ code: 'No connection', message: 'No connection available' }}
      />
    ) : (
      <SysinfoComponent
        {...this.state}
        databases={this.props.databases}
        isACausalCluster={this.props.isACausalCluster}
        useDb={this.props.useDb}
      />
    )

    return (
      <FrameTemplate
        header={this.props.frame}
        contents={content}
        statusbar={
          <StatusbarWrapper>
            <Render if={this.state.errors}>
              <FrameError message={this.state.error} />
            </Render>
            <Render if={this.state.success}>
              <StyledStatusBar>
                {this.state.lastFetch &&
                  `Updated: ${dateFormat(this.state.lastFetch)}`}
                {this.state.success}
                <AutoRefreshSpan>
                  <AutoRefreshToggle
                    checked={this.state.autoRefresh}
                    onChange={e => this.setAutoRefresh(e.target.checked)}
                  />
                </AutoRefreshSpan>
              </StyledStatusBar>
            </Render>
          </StatusbarWrapper>
        }
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    hasMultiDbSupport: hasMultiDbSupport(state),
    isACausalCluster: isACausalCluster(state),
    isConnected: isConnected(state),
    databases: getDatabases(state),
    useDb: getUseDb(state)
  }
}

export default withBus(connect(mapStateToProps)(SysInfoFrame))
