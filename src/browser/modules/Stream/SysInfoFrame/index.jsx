/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import {
  SysInfoTableContainer,
  SysInfoTable,
  SysInfoTableEntry
} from 'browser-components/Tables'
import { toHumanReadableBytes } from 'services/utils'
import { mapSysInfoRecords, getTableDataFromRecords } from './sysinfo'
import Render from 'browser-components/Render'
import { QuestionIcon, RefreshIcon } from 'browser-components/icons/Icons'
import {
  StyledStatusBar,
  AutoRefreshToggle,
  RefreshQueriesButton,
  AutoRefreshSpan,
  StatusbarWrapper
} from '../AutoRefresh/styled'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      results: false,
      success: null,
      autoRefreshInterval: 20 // seconds
    }
  }
  clusterResponseHandler (res) {
    if (!res.success) {
      this.setState({ error: 'No causal cluster results', success: false })
      return
    }
    const mappedResult = mapSysInfoRecords(res.result.records)
    const mappedTableComponents = mappedResult.map(ccRecord => {
      const httpUrlForMember = ccRecord.addresses.filter(address => {
        return (
          !address.includes(window.location.href) &&
          (window.location.protocol.startsWith('file:')
            ? address.startsWith('http://')
            : address.startsWith(window.location.protocol))
        )
      })
      return [
        ccRecord.role,
        ccRecord.addresses.join(', '),
        <Render if={httpUrlForMember.length !== 0}>
          <a target='_blank' href={httpUrlForMember[0]}>
            Open
          </a>
        </Render>
      ]
    })
    this.setState({ cc: [{ value: mappedTableComponents }], success: true })
  }
  responseHandler (res) {
    if (!res.success) {
      this.setState({ error: 'No results', success: false })
      return
    }
    const { ha, kernel, cache, tx, primitive } = getTableDataFromRecords(
      res.result.records
    )

    if (ha) {
      const instancesInCluster = ha.InstancesInCluster.map(({ properties }) => {
        return [
          properties.instanceId,
          properties.alive.toString(),
          properties.available.toString(),
          properties.haRole === 'master' ? 'yes' : '-'
        ]
      })

      this.setState({
        ha: [
          { label: 'InstanceId', value: ha.InstanceId },
          { label: 'Role', value: ha.Role },
          { label: 'Alive', value: ha.Alive.toString() },
          { label: 'Available', value: ha.Available.toString() },
          { label: 'Last Committed Tx Id', value: ha.LastCommittedTxId },
          { label: 'Last Update Time', value: ha.LastUpdateTime }
        ],
        haInstances: [{ value: instancesInCluster }]
      })
    }

    const pageCache = [
      { label: 'Faults', value: cache.Faults },
      { label: 'Evictions', value: cache.Evictions },
      { label: 'File Mappings', value: cache.FileMappings },
      { label: 'Bytes Read', value: cache.BytesRead },
      { label: 'Flushes', value: cache.Flushes },
      { label: 'Eviction Exceptions', value: cache.EvictionExceptions },
      { label: 'File Unmappings', value: cache.FileUnmappings },
      { label: 'Bytes Written', value: cache.BytesWritten },
      {
        label: 'Hit Ratio',
        value: cache.HitRatio,
        mapper: v => `${(v * 100).toFixed(2)}%`,
        optional: true
      },
      {
        label: 'Usage Ratio',
        value: cache.UsageRatio,
        mapper: v => `${(v * 100).toFixed(2)}%`,
        optional: true
      }
    ]

    const baseStoreSizes = [
      {
        label: 'Array Store',
        value: toHumanReadableBytes(kernel.ArrayStoreSize)
      },
      {
        label: 'Logical Log',
        value: toHumanReadableBytes(kernel.LogicalLogSize)
      },
      {
        label: 'Node Store',
        value: toHumanReadableBytes(kernel.NodeStoreSize)
      },
      {
        label: 'Property Store',
        value: toHumanReadableBytes(kernel.PropertyStoreSize)
      },
      {
        label: 'Relationship Store',
        value: toHumanReadableBytes(kernel.RelationshipStoreSize)
      },
      {
        label: 'String Store',
        value: toHumanReadableBytes(kernel.StringStoreSize)
      },
      {
        label: 'Total Store Size',
        value: toHumanReadableBytes(kernel.TotalStoreSize)
      }
    ]

    const storeSizes = kernel.CountStoreSize
      ? [
        {
          label: 'Count Store',
          value: toHumanReadableBytes(kernel.CountStoreSize)
        },
        {
          label: 'Label Store',
          value: toHumanReadableBytes(kernel.LabelStoreSize)
        },
        {
          label: 'Index Store',
          value: toHumanReadableBytes(kernel.IndexStoreSize)
        },
        {
          label: 'Schema Store',
          value: toHumanReadableBytes(kernel.SchemaStoreSize)
        },
        ...baseStoreSizes
      ]
      : [...baseStoreSizes]

    this.setState({
      storeSizes,
      idAllocation: [
        { label: 'Node ID', value: primitive.NumberOfNodeIdsInUse },
        { label: 'Property ID', value: primitive.NumberOfPropertyIdsInUse },
        {
          label: 'Relationship ID',
          value: primitive.NumberOfRelationshipIdsInUse
        },
        {
          label: 'Relationship Type ID',
          value: primitive.NumberOfRelationshipTypeIdsInUse
        }
      ],
      pageCache,
      transactions: [
        { label: 'Last Tx Id', value: tx.LastCommittedTxId },
        { label: 'Current', value: tx.NumberOfOpenTransactions },
        { label: 'Peak', value: tx.PeakNumberOfConcurrentTransactions },
        { label: 'Opened', value: tx.NumberOfOpenedTransactions },
        { label: 'Committed', value: tx.NumberOfCommittedTransactions }
      ],
      success: true
    })
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
          query: 'CALL dbms.queryJmx("org.neo4j:*")'
        },
        this.responseHandler.bind(this)
      )
      if (this.props.isACausalCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview'
          },
          this.clusterResponseHandler.bind(this)
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
  buildTableData (data) {
    if (!data) return null
    return data.map(props => {
      const { value } = props
      if (value instanceof Array) {
        return value.map(v => (
          <SysInfoTableEntry key={props.label} values={v} />
        ))
      }
      return <SysInfoTableEntry key={props.label} {...props} />
    })
  }
  render () {
    const content = this.props.isConnected ? (
      <SysInfoTableContainer>
        <SysInfoTable key='StoreSizes' header='Store Sizes'>
          {this.buildTableData(this.state.storeSizes)}
        </SysInfoTable>
        <SysInfoTable key='IDAllocation' header='ID Allocation'>
          {this.buildTableData(this.state.idAllocation)}
        </SysInfoTable>
        <SysInfoTable key='PageCache' header='Page Cache'>
          {this.buildTableData(this.state.pageCache)}
        </SysInfoTable>
        <SysInfoTable key='Transactionss' header='Transactions'>
          {this.buildTableData(this.state.transactions)}
        </SysInfoTable>
        <Render if={this.props.isACausalCluster}>
          <SysInfoTable
            key='cc-table'
            header={
              <span data-test-id='sysinfo-casual-cluster-members-title'>
                Causal Cluster Members{' '}
                <QuestionIcon title='Values shown in `:sysinfo` may differ between cluster members' />
              </span>
            }
            colspan='3'
          >
            <SysInfoTableEntry
              key='cc-entry'
              headers={['Roles', 'Addresses', 'Actions']}
            />
            {this.buildTableData(this.state.cc)}
          </SysInfoTable>
        </Render>
        <Render if={this.state.ha}>
          <SysInfoTable key='ha-table' header='High Availability'>
            {this.buildTableData(this.state.ha)}
          </SysInfoTable>
        </Render>
        <Render if={this.state.haInstances}>
          <SysInfoTable key='cluster-table' header='Cluster' colspan='4'>
            <SysInfoTableEntry
              key='ha-entry'
              headers={['Id', 'Alive', 'Available', 'Is Master']}
            />
            {this.buildTableData(this.state.haInstances)}
          </SysInfoTable>
        </Render>
      </SysInfoTableContainer>
    ) : (
      'No connection available'
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
                    onClick={e => this.setAutoRefresh(e.target.checked)}
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
    isACausalCluster: isACausalCluster(state),
    isConnected: isConnected(state)
  }
}

export default withBus(
  connect(
    mapStateToProps,
    null
  )(SysInfoFrame)
)
