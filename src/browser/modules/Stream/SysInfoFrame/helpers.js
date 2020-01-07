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

import React from 'react'
import {
  buildTableData,
  flattenAttributes,
  mapSysInfoRecords
} from './sysinfo-utils'
import { toHumanReadableBytes, toKeyString } from 'services/utils'
import {
  SysInfoTableContainer,
  SysInfoTable,
  SysInfoTableEntry
} from 'browser-components/Tables'
import Render from 'browser-components/Render/index'

const jmxPrefix = 'neo4j.metrics:name='

export const sysinfoQuery = useDb => `
// Store size. Per db
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.store.size.total") YIELD name, attributes
RETURN "Store Size" AS group, name, attributes
UNION ALL

// Page cache. Per DBMS.
CALL dbms.queryJmx("${jmxPrefix}neo4j.page_cache.flushes") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.page_cache.evictions") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.page_cache.eviction_exceptions") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.page_cache.hit_ratio") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.page_cache.usage_ratio") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL

// Primitive counts. Per db.
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.ids_in_use.node") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.ids_in_use.property") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.ids_in_use.relationship") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.ids_in_use.relationship_type") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL

// Transactions. Per db.
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.transaction.last_committed_tx_id") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.transaction.active") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.transaction.peak_concurrent") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.transaction.started") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("${jmxPrefix}neo4j.${useDb}.transaction.committed") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
`

export const Sysinfo = ({
  databases,
  pageCache,
  storeSizes,
  idAllocation,
  transactions,
  isACausalCluster,
  cc
}) => {
  const mappedDatabases = [
    {
      value: databases.map(db => {
        return [
          db.name,
          db.address,
          db.role,
          db.status,
          db.default ? 'true' : '-',
          db.error
        ]
      })
    }
  ]

  return (
    <SysInfoTableContainer>
      <SysInfoTable key="StoreSize" header="Store Size" colspan="2">
        {buildTableData(storeSizes)}
      </SysInfoTable>
      <SysInfoTable key="IDAllocation" header="Id Allocation">
        {buildTableData(idAllocation)}
      </SysInfoTable>
      <SysInfoTable key="PageCache" header="Page Cache">
        {buildTableData(pageCache)}
      </SysInfoTable>
      <SysInfoTable key="Transactionss" header="Transactions">
        {buildTableData(transactions)}
      </SysInfoTable>
      <SysInfoTable key="database-table" header="Databases" colspan="6">
        <SysInfoTableEntry
          key="database-entry"
          headers={['Name', 'Address', 'Role', 'Status', 'Default', 'Error']}
        />
        {buildTableData(mappedDatabases)}
      </SysInfoTable>
    </SysInfoTableContainer>
  )
}

export const responseHandler = (setState, useDb) =>
  function(res) {
    if (!res || !res.result || !res.result.records) {
      setState({ success: false })
      return null
    }
    const intoGroups = res.result.records.reduce((grouped, record) => {
      if (!grouped.hasOwnProperty(record.get('group'))) {
        grouped[record.get('group')] = {
          name: record.get('group'),
          attributes: []
        }
      }
      const mappedRecord = {
        name: record.get('name').replace(jmxPrefix, ''),
        value: (
          record.get('attributes').Count || record.get('attributes').Value
        ).value
      }
      grouped[record.get('group')].attributes.push(mappedRecord)
      return grouped
    }, {})

    // Page cache
    const size = flattenAttributes(intoGroups['Store Size'])
    const storeSizes = [
      {
        label: 'Size',
        value: toHumanReadableBytes(size[`neo4j.${useDb}.store.size.total`])
      }
    ]
    const cache = flattenAttributes(intoGroups['Page Cache'])
    const pageCache = [
      { label: 'Flushes', value: cache['neo4j.page_cache.flushes'] },
      { label: 'Evictions', value: cache['neo4j.page_cache.evictions'] },
      {
        label: 'Eviction Exceptions',
        value: cache['neo4j.page_cache.eviction_exceptions']
      },
      {
        label: 'Hit Ratio',
        value: cache['neo4j.page_cache.hit_ratio'],
        mapper: v => `${(v * 100).toFixed(2)}%`,
        optional: true
      },
      {
        label: 'Usage Ratio',
        value: cache['neo4j.page_cache.usage_ratio'],
        mapper: v => `${(v * 100).toFixed(2)}%`,
        optional: true
      }
    ]

    // Primitive count
    const primitive = flattenAttributes(intoGroups['Primitive Count'])
    const idAllocation = [
      { label: 'Node ID', value: primitive[`neo4j.${useDb}.ids_in_use.node`] },
      {
        label: 'Property ID',
        value: primitive[`neo4j.${useDb}.ids_in_use.property`]
      },
      {
        label: 'Relationship ID',
        value: primitive[`neo4j.${useDb}.ids_in_use.relationship`]
      },
      {
        label: 'Relationship Type ID',
        value: primitive[`neo4j.${useDb}.ids_in_use.relationship_type`]
      }
    ]

    // Transactions
    const tx = flattenAttributes(intoGroups.Transactions)
    const transactions = [
      {
        label: 'Last Tx Id',
        value: tx[`neo4j.${useDb}.transaction.last_committed_tx_id`]
      },
      { label: 'Current', value: tx[`neo4j.${useDb}.transaction.active`] },
      {
        label: 'Peak',
        value: tx[`neo4j.${useDb}.transaction.peak_concurrent`]
      },
      { label: 'Opened', value: tx[`neo4j.${useDb}.transaction.started`] },
      { label: 'Committed', value: tx[`neo4j.${useDb}.transaction.committed`] }
    ]

    setState({
      pageCache,
      storeSizes,
      idAllocation,
      transactions,
      success: true
    })
  }

export const clusterResponseHandler = setState =>
  function(res) {
    if (!res.success) {
      setState({ error: 'No causal cluster results', success: false })
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
      const databases = Object.keys(ccRecord.databases).map(
        db => `${db}: ${ccRecord.databases[db]}`
      )
      return [
        databases.join(', '),
        ccRecord.addresses.join(', '),
        <Render
          key={toKeyString(httpUrlForMember[0])}
          if={httpUrlForMember.length !== 0}
        >
          <a
            rel="noopener noreferrer"
            target="_blank"
            href={httpUrlForMember[0]}
          >
            Open
          </a>
        </Render>
      ]
    })
    setState({ cc: [{ value: mappedTableComponents }], success: true })
  }
