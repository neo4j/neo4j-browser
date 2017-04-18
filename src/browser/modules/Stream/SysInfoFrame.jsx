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
import { getAvailableProcedures } from 'shared/modules/features/featuresDuck'
import FrameTemplate from '../Stream/FrameTemplate'
import FrameError from '../Stream/FrameError'
import { SysInfoTableContainer, SysInfoTable, SysInfoTableEntry } from 'browser-components/Tables'
import bolt from 'services/bolt/bolt'
import { itemIntToString } from 'services/bolt/boltMappings'
import { toHumanReadableBytes } from 'services/utils'
import Visible from 'browser-components/Visible'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      cc: [],
      haInstances: []
    }
  }
  flattenAttributes (a) {
    if (a && a.attributes) {
      return Object.assign({}, ...a.attributes.map(({name, value}) => ({ [name]: itemIntToString(value, bolt.neo4j.isInt, (val) => val.toString()) })))
    } else {
      return null
    }
  }
  clusterResponseHandler () {
    return (res) => {
      if (!res.success) {
        this.setState({error: 'No causal cluster results'})
        return
      }
      const mappedResult = res.result.records.map((record) => {
        return {
          id: record.get('id'),
          addresses: record.get('addresses'),
          role: record.get('role'),
          tags: record.get('tags')
        }
      })
      const mappedTableHeader = <SysInfoTableEntry headers={['Roles', 'Addresses', 'Actions']} />
      const mappedTableComponents = mappedResult.map((ccRecord) => {
        const httpUrlForMember = ccRecord.addresses.filter((address) => {
          return address.startsWith('http://') && !address.includes(window.location.href)
        })
        const arrayOfValue = [
          ccRecord.role,
          ccRecord.addresses.join(', '),
          <Visible if={httpUrlForMember.length !== 0}><a taget='_blank' href={httpUrlForMember[0]}>Open</a></Visible>
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

      const mappedJMXresult = res.result.records.map((record) => {
        const origAttributes = record.get('attributes')
        return {
          name: record.get('name'),
          description: record.get('description'),
          attributes: Object.keys(record.get('attributes')).map((attributeName) => {
            return {
              name: attributeName,
              description: origAttributes[attributeName].description,
              value: origAttributes[attributeName].value
            }
          })
        }
      })

      const jmxQueryPrefix = mappedJMXresult[0].name.split(',')[0]
      const result = Object.assign({}, ...mappedJMXresult.map((item) => {
        return { [item.name]: item }
      }))
      const cache = this.flattenAttributes(result[`${jmxQueryPrefix},name=Page cache`]) || {}
      const primitive = this.flattenAttributes(result[`${jmxQueryPrefix},name=Primitive count`])
      const tx = this.flattenAttributes(result[`${jmxQueryPrefix},name=Transactions`]) || {}
      const kernel = Object.assign({},
        this.flattenAttributes(result[`${jmxQueryPrefix},name=Configuration`]),
        this.flattenAttributes(result[`${jmxQueryPrefix},name=Kernel`]),
        this.flattenAttributes(result[`${jmxQueryPrefix},name=Store file sizes`]))

      if (result[`${jmxQueryPrefix},name=High Availability`]) {
        const ha = this.flattenAttributes(result[`${jmxQueryPrefix},name=High Availability`])
        const haInstancesHeader = <SysInfoTableEntry headers={['Id', 'Alive', 'Available', 'Is Master']} />
        const haInstances = [haInstancesHeader].concat(ha.InstancesInCluster.map(({properties}) => {
          const haInstancePropertyValues = [properties.instanceId, properties.alive.toString(), properties.available.toString(), (properties.haRole === 'master') ? 'yes' : '-']
          return <SysInfoTableEntry values={haInstancePropertyValues} />
        }))
        this.setState({ha: [
          <SysInfoTableEntry label='InstanceId' value={ha.InstanceId} />,
          <SysInfoTableEntry label='Role' value={ha.Role} />,
          <SysInfoTableEntry label='Alive' value={ha.Alive.toString()} />,
          <SysInfoTableEntry label='Available' value={ha.Available.toString()} />,
          <SysInfoTableEntry label='Last Committed Tx Id' value={ha.LastCommittedTxId} />,
          <SysInfoTableEntry label='Last Update Time' value={ha.LastUpdateTime} />
        ],
          'haInstances': haInstances
        })
      }

      this.setState({'storeSizes': [
        <SysInfoTableEntry label='Array Store' value={toHumanReadableBytes(kernel.ArrayStoreSize)} />,
        <SysInfoTableEntry label='Logical Log' value={toHumanReadableBytes(kernel.LogicalLogSize)} />,
        <SysInfoTableEntry label='Node Store' value={toHumanReadableBytes(kernel.NodeStoreSize)} />,
        <SysInfoTableEntry label='Property Store' value={toHumanReadableBytes(kernel.PropertyStoreSize)} />,
        <SysInfoTableEntry label='Relationship Store' value={toHumanReadableBytes(kernel.RelationshipStoreSize)} />,
        <SysInfoTableEntry label='String Store' value={toHumanReadableBytes(kernel.StringStoreSize)} />,
        <SysInfoTableEntry label='Total Store Size' value={toHumanReadableBytes(kernel.TotalStoreSize)} />
      ],
        'idAllocation': [
          <SysInfoTableEntry label='Node ID' value={primitive.NumberOfNodeIdsInUse} />,
          <SysInfoTableEntry label='Propery ID' value={primitive.NumberOfPropertyIdsInUse} />,
          <SysInfoTableEntry label='Relationship ID' value={primitive.NumberOfRelationshipIdsInUse} />,
          <SysInfoTableEntry label='Relationship Type ID' value={primitive.NumberOfRelationshipTypeIdsInUse} />
        ],
        'pageCache': [
          <SysInfoTableEntry label='Faults' value={cache.Faults} />,
          <SysInfoTableEntry label='Evictions' value={cache.Evictions} />,
          <SysInfoTableEntry label='File Mappings' value={cache.FileMappings} />,
          <SysInfoTableEntry label='Bytes Read' value={cache.BytesRead} />,
          <SysInfoTableEntry label='Flushes' value={cache.Flushes} />,
          <SysInfoTableEntry label='Eviction Exceptions' value={cache.EvictionExceptions} />,
          <SysInfoTableEntry label='File Unmappings' value={cache.FileUnmappings} />,
          <SysInfoTableEntry label='Bytes Written' value={cache.BytesWritten} />
        ],
        'transactions': [
          <SysInfoTableEntry label='Last Tx Id' value={tx.LastCommittedTxId} />,
          <SysInfoTableEntry label='Current' value={tx.NumberOfOpenTransactions} />,
          <SysInfoTableEntry label='Peak' value={tx.PeakNumberOfConcurrentTransactions} />,
          <SysInfoTableEntry label='Opened' value={tx.NumberOfOpenedTransactions} />,
          <SysInfoTableEntry label='Committed' value={tx.NumberOfCommittedTransactions} />
        ]})
    }
  }
  isCC () {
    return this.props.availableProcedures.includes('dbms.cluster.overview')
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
    }
    if (this.isCC()) {
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL dbms.cluster.overview'
        },
        this.clusterResponseHandler()
      )
    }
  }
  render () {
    const content = (
      <SysInfoTableContainer>
        <SysInfoTable header='Store Sizes'>
          {this.state.storeSizes || null}
        </SysInfoTable>
        <SysInfoTable header='ID Allocation'>
          {this.state.idAllocation || null}
        </SysInfoTable>
        <SysInfoTable header='Page Cache'>
          {this.state.pageCache || null}
        </SysInfoTable>
        <SysInfoTable header='Transactions'>
          {this.state.transactions || null}
        </SysInfoTable>
        <Visible if={this.isCC()}>
          <SysInfoTable header='Causal Cluster Members' colspan={this.state.cc.length - 1}>
            {this.state.cc || null}
          </SysInfoTable>
        </Visible>
        <Visible if={this.state.ha}>
          <SysInfoTable header='High Availability'>
            {this.state.ha || null}
          </SysInfoTable>
        </Visible>
        <Visible if={this.state.haInstances.length}>
          <SysInfoTable header='Cluster' colspan={this.state.haInstances.length}>
            {this.state.haInstances || null}
          </SysInfoTable>
        </Visible>
      </SysInfoTableContainer>
    )
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
    availableProcedures: getAvailableProcedures(state) || []
  }
}

export default withBus(connect(mapStateToProps, null)(SysInfoFrame))
