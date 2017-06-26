/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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
import FrameTemplate from '../Stream/FrameTemplate'
import FrameError from '../Stream/FrameError'
import { SysInfoTableContainer, SysInfoTable, SysInfoTableEntry } from 'browser-components/Tables'
import { toHumanReadableBytes } from 'services/utils'
import { mapSysInfoRecords, getTableDataFromRecords } from 'shared/modules/commands/helpers/sysinfo'
import Render from 'browser-components/Render'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      results: false
    }
  }

  clusterResponseHandler () {
    return (res) => {
      if (!res.success) {
        this.setState({error: 'No causal cluster results'})
        return
      }
      const mappedResult = mapSysInfoRecords(res.result.records)
      const mappedTableHeader = <SysInfoTableEntry headers={['Roles', 'Addresses', 'Actions']} />
      const mappedTableComponents = mappedResult.map((ccRecord) => {
        const httpUrlForMember = ccRecord.addresses.filter((address) => {
          return address.startsWith('http://') && !address.includes(window.location.href)
        })
        const arrayOfValue = [
          ccRecord.role,
          ccRecord.addresses.join(', '),
          <Render if={httpUrlForMember.length !== 0}><a taget='_blank' href={httpUrlForMember[0]}>Open</a></Render>
        ]
        return <SysInfoTableEntry values={arrayOfValue} />
      })
      this.setState({cc: [mappedTableHeader].concat(mappedTableComponents)})
    }
  }
  responseHandler () {
    return (res) => {
      if (!res.success) {
        this.setState({error: 'No results'})
        return
      }
      const tableData = getTableDataFromRecords(res.result.records)
      const {ha, kernel, cache, tx, primitive} = tableData

      if (ha) {
        const haInstancesHeader = <SysInfoTableEntry headers={['Id', 'Alive', 'Available', 'Is Master']} />
        this.haInstances = [haInstancesHeader].concat(ha.InstancesInCluster.map(({properties}) => {
          const haInstancePropertyValues = [properties.instanceId, properties.alive.toString(), properties.available.toString(), (properties.haRole === 'master') ? 'yes' : '-']
          return <SysInfoTableEntry values={haInstancePropertyValues} />
        }))
        this.ha = [
          <SysInfoTableEntry label='InstanceId' value={ha.InstanceId} />,
          <SysInfoTableEntry label='Role' value={ha.Role} />,
          <SysInfoTableEntry label='Alive' value={ha.Alive.toString()} />,
          <SysInfoTableEntry label='Available' value={ha.Available.toString()} />,
          <SysInfoTableEntry label='Last Committed Tx Id' value={ha.LastCommittedTxId} />,
          <SysInfoTableEntry label='Last Update Time' value={ha.LastUpdateTime} />
        ]
      }

      this.storeSizes = [
        <SysInfoTableEntry label='Array Store' value={toHumanReadableBytes(kernel.ArrayStoreSize)} />,
        <SysInfoTableEntry label='Logical Log' value={toHumanReadableBytes(kernel.LogicalLogSize)} />,
        <SysInfoTableEntry label='Node Store' value={toHumanReadableBytes(kernel.NodeStoreSize)} />,
        <SysInfoTableEntry label='Property Store' value={toHumanReadableBytes(kernel.PropertyStoreSize)} />,
        <SysInfoTableEntry label='Relationship Store' value={toHumanReadableBytes(kernel.RelationshipStoreSize)} />,
        <SysInfoTableEntry label='String Store' value={toHumanReadableBytes(kernel.StringStoreSize)} />,
        <SysInfoTableEntry label='Total Store Size' value={toHumanReadableBytes(kernel.TotalStoreSize)} />
      ]
      this.idAllocation = [
        <SysInfoTableEntry label='Node ID' value={primitive.NumberOfNodeIdsInUse} />,
        <SysInfoTableEntry label='Property ID' value={primitive.NumberOfPropertyIdsInUse} />,
        <SysInfoTableEntry label='Relationship ID' value={primitive.NumberOfRelationshipIdsInUse} />,
        <SysInfoTableEntry label='Relationship Type ID' value={primitive.NumberOfRelationshipTypeIdsInUse} />
      ]
      this.pageCache = [
        <SysInfoTableEntry label='Faults' value={cache.Faults} />,
        <SysInfoTableEntry label='Evictions' value={cache.Evictions} />,
        <SysInfoTableEntry label='File Mappings' value={cache.FileMappings} />,
        <SysInfoTableEntry label='Bytes Read' value={cache.BytesRead} />,
        <SysInfoTableEntry label='Flushes' value={cache.Flushes} />,
        <SysInfoTableEntry label='Eviction Exceptions' value={cache.EvictionExceptions} />,
        <SysInfoTableEntry label='File Unmappings' value={cache.FileUnmappings} />,
        <SysInfoTableEntry label='Bytes Written' value={cache.BytesWritten} />
      ]
      this.transactions = [
        <SysInfoTableEntry label='Last Tx Id' value={tx.LastCommittedTxId} />,
        <SysInfoTableEntry label='Current' value={tx.NumberOfOpenTransactions} />,
        <SysInfoTableEntry label='Peak' value={tx.PeakNumberOfConcurrentTransactions} />,
        <SysInfoTableEntry label='Opened' value={tx.NumberOfOpenedTransactions} />,
        <SysInfoTableEntry label='Committed' value={tx.NumberOfCommittedTransactions} />
      ]
      this.setState({results: true})
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL dbms.queryJmx("org.neo4j:*")'
        },
        this.responseHandler()
      )
      if (this.props.isACausalCluster) {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'CALL dbms.cluster.overview'
          },
          this.clusterResponseHandler()
        )
      }
    }
  }
  render () {
    const content = (this.state.results)
      ? (<SysInfoTableContainer>
        <SysInfoTable header='Store Sizes'>
          {this.storeSizes || null}
        </SysInfoTable>
        <SysInfoTable header='ID Allocation'>
          {this.idAllocation || null}
        </SysInfoTable>
        <SysInfoTable header='Page Cache'>
          {this.pageCache || null}
        </SysInfoTable>
        <SysInfoTable header='Transactions'>
          {this.transactions || null}
        </SysInfoTable>
        <Render if={this.props.isACausalCluster}>
          <SysInfoTable header='Causal Cluster Members' colspan={(this.cc) ? this.cc.length - 1 : 0}>
            {this.cc || null}
          </SysInfoTable>
        </Render>
        <Render if={this.ha}>
          <SysInfoTable header='High Availability'>
            {this.ha || null}
          </SysInfoTable>
        </Render>
        <Render if={this.haInstances}>
          <SysInfoTable header='Cluster' colspan={(this.haInstances) ? this.haInstances.length : 0}>
            {this.haInstances || null}
          </SysInfoTable>
        </Render>
      </SysInfoTableContainer>)
    : null
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={content}
      >
        <FrameError message={this.state.error} />
      </FrameTemplate>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    isACausalCluster: isACausalCluster(state)
  }
}

export default withBus(connect(mapStateToProps, null)(SysInfoFrame))
