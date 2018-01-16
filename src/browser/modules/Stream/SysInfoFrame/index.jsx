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

import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { isACausalCluster } from 'shared/modules/features/featuresDuck'
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

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      results: false
    }
  }
  clusterResponseHandler (res) {
    if (!res.success) {
      this.setState({ error: 'No causal cluster results' })
      return
    }
    const mappedResult = mapSysInfoRecords(res.result.records)
    const mappedTableComponents = mappedResult.map(ccRecord => {
      const httpUrlForMember = ccRecord.addresses.filter(address => {
        return (
          address.startsWith('http://') &&
          !address.includes(window.location.href)
        )
      })
      return [
        ccRecord.role,
        ccRecord.addresses.join(', '),
        <Render if={httpUrlForMember.length !== 0}>
          <a taget='_blank' href={httpUrlForMember[0]}>
            Open
          </a>
        </Render>
      ]
    })
    this.setState({ cc: [{ value: mappedTableComponents }] })
  }
  responseHandler (res) {
    if (!res.success) {
      this.setState({ error: 'No results' })
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

    this.setState({
      storeSizes: [
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
      ],
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
      pageCache: [
        { label: 'Faults', value: cache.Faults },
        { label: 'Evictions', value: cache.Evictions },
        { label: 'File Mappings', value: cache.FileMappings },
        { label: 'Bytes Read', value: cache.BytesRead },
        { label: 'Flushes', value: cache.Flushes },
        { label: 'Eviction Exceptions', value: cache.EvictionExceptions },
        { label: 'File Unmappings', value: cache.FileUnmappings },
        { label: 'Bytes Written', value: cache.BytesWritten }
      ],
      transactions: [
        { label: 'Last Tx Id', value: tx.LastCommittedTxId },
        { label: 'Current', value: tx.NumberOfOpenTransactions },
        { label: 'Peak', value: tx.PeakNumberOfConcurrentTransactions },
        { label: 'Opened', value: tx.NumberOfOpenedTransactions },
        { label: 'Committed', value: tx.NumberOfCommittedTransactions }
      ]
    })
  }
  componentDidMount () {
    if (this.props.bus) {
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
    }
  }
  buildTableData (data) {
    if (!data) return null
    return data.map(({ label, value }) => {
      if (value instanceof Array) {
        return value.map(v => <SysInfoTableEntry values={v} />)
      }
      return <SysInfoTableEntry label={label} value={value} />
    })
  }
  render () {
    const content = (
      <SysInfoTableContainer>
        <SysInfoTable header='Store Sizes'>
          {this.buildTableData(this.state.storeSizes)}
        </SysInfoTable>
        <SysInfoTable header='ID Allocation'>
          {this.buildTableData(this.state.idAllocation)}
        </SysInfoTable>
        <SysInfoTable header='Page Cache'>
          {this.buildTableData(this.state.pageCache)}
        </SysInfoTable>
        <SysInfoTable header='Transactions'>
          {this.buildTableData(this.state.transactions)}
        </SysInfoTable>
        <Render if={this.props.isACausalCluster}>
          <SysInfoTable header='Causal Cluster Members' colspan='3'>
            <SysInfoTableEntry headers={['Roles', 'Addresses', 'Actions']} />
            {this.buildTableData(this.state.cc)}
          </SysInfoTable>
        </Render>
        <Render if={this.state.ha}>
          <SysInfoTable header='High Availability'>
            {this.buildTableData(this.state.ha)}
          </SysInfoTable>
        </Render>
        <Render if={this.state.haInstances}>
          <SysInfoTable header='Cluster' colspan='4'>
            <SysInfoTableEntry
              headers={['Id', 'Alive', 'Available', 'Is Master']}
            />
            {this.buildTableData(this.state.haInstances)}
          </SysInfoTable>
        </Render>
      </SysInfoTableContainer>
    )

    return (
      <FrameTemplate header={this.props.frame} contents={content}>
        <FrameError message={this.state.error} />
      </FrameTemplate>
    )
  }
}

const mapStateToProps = state => {
  return {
    isACausalCluster: isACausalCluster(state)
  }
}

export default withBus(connect(mapStateToProps, null)(SysInfoFrame))
