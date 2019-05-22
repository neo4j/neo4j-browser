/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { isACausalCluster } from 'shared/modules/features/featuresDuck'
import { isConnected } from 'shared/modules/connections/connectionsDuck'
import FrameTemplate from 'browser/modules/Stream/FrameTemplate'
import FrameError from 'browser/modules/Stream/FrameError'
import Render from 'browser-components/Render'
import { RefreshIcon } from 'browser-components/icons/Icons'
import {
  StyledStatusBar,
  AutoRefreshToggle,
  RefreshQueriesButton,
  AutoRefreshSpan,
  StatusbarWrapper
} from '../AutoRefresh/styled'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { hasMultiDbSupport } from 'shared/modules/features/versionedFeatures'
import {
  responseHandler,
  sysInfoQuery,
  clusterResponseHandler,
  LegacySysinfo
} from './legacyHelpers'
import { ErrorsView } from '../CypherFrame/ErrorsView'
import { getDatabases } from 'shared/modules/dbMeta/dbMetaDuck'
import { Sysinfo } from './helpers'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
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

  componentDidMount () {
    this.getSysInfo()
  }
  componentDidUpdate (prevProps, prevState) {
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
  }
  getSysInfo () {
    if (this.props.bus && this.props.isConnected) {
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: sysInfoQuery,
          queryType: NEO4J_BROWSER_USER_ACTION_QUERY
        },
        responseHandler(this.setState.bind(this))
      )
      if (this.props.isACausalCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview',
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          clusterResponseHandler(this.setState.bind(this))
        )
      }
    } else {
      this.setState({ error: 'No connection available' })
    }
  }
  setAutoRefresh (autoRefresh) {
    this.setState({ autoRefresh: autoRefresh })

    if (autoRefresh) {
      this.getSysInfo()
    }
  }
  render () {
    const content = !this.props.isConnected ? (
      <ErrorsView
        result={{ code: 'No connection', message: 'No connection available' }}
      />
    ) : this.props.hasMultiDbSupport ? (
      <Sysinfo
        {...this.state}
        databases={this.props.databases}
        isACausalCluster={this.props.isACausalCluster}
      />
    ) : (
      <LegacySysinfo
        {...this.state}
        isACausalCluster={this.props.isACausalCluster}
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
                {this.state.success}
                <RefreshQueriesButton onClick={() => this.getSysInfo()}>
                  <RefreshIcon />
                </RefreshQueriesButton>
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
    databases: getDatabases(state)
  }
}

export default withBus(connect(mapStateToProps)(SysInfoFrame))
