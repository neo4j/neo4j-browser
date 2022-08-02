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
import React from 'react'

import { toKeyString } from 'neo4j-arc/common'

import { flattenAttributes, mapSysInfoRecords } from './sysinfoUtils'
import { toHumanReadableBytes } from 'services/utils'

/*
The database provides a number of ways to monitor it's health, we use JMX MBeans.
JMX MBeans is a java extension that allows us to query the database for stats and is enabled by default since neo4j 4.2.2. 
It's used through the `dbms.queryJmx(<searchprefix>=<metric_name>)` where the searchprefix is '<userDefinedPrefix>.metrics:name'
 and the metric_name name has a few variations and depends on the following: 
- If it's a "global" or "database" metric (global meaning the entire dbms in this context)
- What `metrics.prefix` is set to in neo4j.conf (default is neo4j)
- If `metrics.namespaces.enabled` is true of false in neo4j.conf (this setting was introduced when multidb was added)

An example using the `store.size.total` metric with the following config: 
- which is a "database" metric, 
- with namespaces.enabled=false, 
- against a database called foo and 
- metrics.prefix=abc

The metric name will be :
abc.foo.store.size.total 

And the full query:
CALL dbms.queryJmx("abc.metrics:name=abc.foo.store.size.total")

When a query is malformed, or the specific metric is filtered out an empty array is returned but no error.
So to debug a jmx query make sure to read the docs on the exact syntax and check the metrics.filter setting.

See docs for reference on what metrics exist & how to correctly query jmx: https://neo4j.com/docs/operations-manual/current/monitoring/metrics/reference/
See docs for what metrics are filtered out by default and other for relevant settings: https://neo4j.com/docs/operations-manual/current/reference/configuration-settings/#config_metrics.namespaces.enabled
*/
type SysInfoMetrics = {
  group: string
  type: MetricType
  baseMetricNames: string[]
}
const sysInfoMetrics: SysInfoMetrics[] = [
  {
    group: 'Store Size',
    type: 'database',
    baseMetricNames: ['store.size.total', 'store.size.database']
  },
  {
    group: 'Page Cache',
    type: 'dbms',
    baseMetricNames: [
      'page_cache.hits',
      'page_cache.hit_ratio',
      'page_cache.usage_ratio',
      'page_cache.page_faults'
    ]
  },
  {
    group: 'Primitive Count',
    type: 'database',
    baseMetricNames: [
      'ids_in_use.node',
      'ids_in_use.property',
      'ids_in_use.relationship',
      'ids_in_use.relationship_type'
    ]
  },
  {
    group: 'Transactions',
    type: 'database',
    baseMetricNames: [
      'transaction.last_committed_tx_id',
      'transaction.peak_concurrent',
      'transaction.active_read',
      'transaction.active_write',
      'transaction.committed_read',
      'transaction.committed_write'
    ]
  }
]

type MetricType = 'database' | 'dbms'
type MetricSettings = {
  databaseName: string
  namespacesEnabled: boolean
  metricsPrefix: string
}
type ConstructorParams = MetricSettings & {
  baseMetricName: string
  type: MetricType
  group: string
}

function constructQuery({
  metricsPrefix,
  namespacesEnabled,
  databaseName,
  baseMetricName,
  type,
  group
}: ConstructorParams) {
  // Build full metric name of format:
  // <user-configured-prefix>.[namespace?].[databaseName?].<metric-name>
  const parts = []
  if (namespacesEnabled) {
    parts.push(type)
  }

  if (type === 'database') {
    parts.push(databaseName)
  }

  parts.push(baseMetricName)
  const metricName = parts.join('.')

  return `CALL dbms.queryJmx("${metricsPrefix}.metrics:name=${metricsPrefix}.${metricName}") YIELD name, attributes RETURN "${group}" AS group, name, attributes`
}

export function sysinfoQuery({
  databaseName,
  namespacesEnabled,
  metricsPrefix
}: MetricSettings): string {
  const queries = sysInfoMetrics
    .map(({ group, type, baseMetricNames }) =>
      baseMetricNames.map(baseMetricName =>
        constructQuery({
          databaseName,
          namespacesEnabled,
          metricsPrefix,
          baseMetricName,
          group,
          type
        })
      )
    )
    .reduce(flatten, [])
  const joinedToBigQuery = queries.join(' UNION ALL\n') + ';'
  return joinedToBigQuery
}

function flatten<T>(acc: T[], curr: T[]): T[] {
  return acc.concat(curr)
}

export const responseHandler = (setState: (newState: any) => void) =>
  function (res: any): void {
    if (!res || !res.result || !res.result.records) {
      setState({ errorMessage: 'Call to dbms.queryJmx failed' })
      return
    }

    const intoGroups = res.result.records.reduce(
      (grouped: any, record: any) => {
        if (!grouped.hasOwnProperty(record.get('group'))) {
          grouped[record.get('group')] = {
            name: record.get('group'),
            attributes: []
          }
        }
        const mappedRecord = {
          name: record.get('name').split('.').pop(),
          value: (
            record.get('attributes').Count || record.get('attributes').Value
          ).value
        }
        grouped[record.get('group')].attributes.push(mappedRecord)
        return grouped
      },
      {}
    )

    // Page cache
    const size = flattenAttributes(intoGroups['Store Size'])
    const storeSizes = [
      {
        label: 'Total',
        value: size.total ? toHumanReadableBytes(size.total) : size.total
      },
      {
        label: 'Database',
        value: size.database
          ? toHumanReadableBytes(size.database)
          : size.database
      }
    ]

    const cache = flattenAttributes(intoGroups['Page Cache'])
    const pageCache = [
      { label: 'Hits', value: cache.hits },
      { label: 'Page Faults', value: cache.page_faults },
      {
        label: 'Hit Ratio',
        value: cache.hit_ratio,
        mapper: (v: number) => `${(v * 100).toFixed(2)}%`,
        optional: true
      },
      {
        label: 'Usage Ratio',
        value: cache.usage_ratio,
        mapper: (v: number) => `${(v * 100).toFixed(2)}%`,
        optional: true
      }
    ]

    // Primitive count
    const primitive = flattenAttributes(intoGroups['Primitive Count'])
    const idAllocation = [
      { label: 'Node ID', value: primitive.node },
      {
        label: 'Property ID',
        value: primitive.property
      },
      {
        label: 'Relationship ID',
        value: primitive.relationship
      },
      {
        label: 'Relationship Type ID',
        value: primitive.relationship_type
      }
    ]

    // Transactions
    const tx = flattenAttributes(intoGroups.Transactions)
    const transactions = [
      {
        label: 'Last Tx Id',
        value: tx.last_committed_tx_id
      },
      { label: 'Current Read', value: tx.active_read },
      { label: 'Current Write', value: tx.active_write },
      {
        label: 'Peak Transactions',
        value: tx.peak_concurrent
      },
      { label: 'Committed Read', value: tx.committed_read },
      { label: 'Committed Write', value: tx.committed_write }
    ]

    const valuesMissing = [
      storeSizes,
      pageCache,
      idAllocation,
      transactions
    ].some(metricType =>
      metricType.some((item: any) => item.value === undefined)
    )

    setState({
      pageCache,
      storeSizes,
      idAllocation,
      transactions,
      errorMessage: valuesMissing
        ? 'Some metrics missing, check neo4j.conf'
        : null
    })
  }

export const clusterResponseHandler = (setState: any) =>
  function (res: any) {
    if (!res.success) {
      setState({ error: 'No cluster results', success: false })
      return
    }
    const mappedResult = mapSysInfoRecords(res.result.records)
    const mappedTableComponents = mappedResult.map((ccRecord: any) => {
      const httpUrlForMember = ccRecord.addresses.filter((address: any) => {
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
        httpUrlForMember.length !== 0 ? (
          <a
            rel="noopener noreferrer"
            key={toKeyString(httpUrlForMember[0])}
            target="_blank"
            href={httpUrlForMember[0]}
          >
            Open
          </a>
        ) : null
      ]
    })
    setState({
      clusterMembers: [{ value: mappedTableComponents }],
      success: true
    })
  }
