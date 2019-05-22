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

import React from 'react'
import {
  buildTableData,
  getTableDataFromRecords,
  flattenAttributes
} from './sysinfo-utils'
import { SysInfoTableContainer, SysInfoTable } from 'browser-components/Tables'

export const sysinfoQuery = useDb => `
// Page cache. Per DBMS.
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.page_cache.flushes") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.page_cache.evictions") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.page_cache.eviction_exceptions") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.page_cache.hit_ratio") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.page_cache.usage_ratio") YIELD name, attributes
RETURN "Page Cache" AS group, name, attributes
UNION ALL

// Primitive counts. Per db.
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.ids_in_use.node") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.ids_in_use.property") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.ids_in_use.relationship") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.ids_in_use.relationship_type") YIELD name, attributes
RETURN "Primitive Count" AS group, name, attributes
UNION ALL

// Transactions. Per db.
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.transaction.last_committed_tx_id") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.transaction.active") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.transaction.peak_concurrent") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.transaction.started") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
UNION ALL
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.${useDb}.transaction.committed") YIELD name, attributes
RETURN "Transactions" AS group, name, attributes
`

export const Sysinfo = ({ databases }) => {
  const mappedDatabases = databases.map(db => {
    return {
      label: db.name,
      value: db.status
    }
  })
  return (
    <SysInfoTableContainer>
      <SysInfoTable key='databases' header='Databases'>
        {buildTableData(mappedDatabases)}
      </SysInfoTable>
    </SysInfoTableContainer>
  )
}

export const responseHandler = setState =>
  function (res) {
    console.log('res: ', res)
    const intoGroups = res.result.records.reduce((grouped, record) => {
      if (!grouped.hasOwnProperty(record.get('group'))) {
        grouped[record.get('group')] = {
          name: record.get('group'),
          attributes: []
        }
      }
      const mappedRecord = {
        name: record.get('name'),
        attributes: record.get('attributes')
      }
      grouped[record.get('group')].attributes.push(mappedRecord)
      return grouped
    }, {})
    console.log('intoGroups: ', intoGroups)
    const x = flattenAttributes(intoGroups['Page Cache'])
    console.log('x: ', x)
  }

export const clusterResponseHandler = setState =>
  function (res) {
    return null
  }
