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

import { flattenAttributes } from './sysinfo-utils'
import { toHumanReadableBytes } from 'services/utils'
import { string } from 'browser/modules/Editor/cypher/functions'

/*
The database provides a number of ways to monitor it's health, we use JMX MBeans.
JMX MBeans is a java extension that allows us to query the database for stats and is enabled by default since neo4j 4.2.2. 
It's used through the `dbms.queryJmx(<searchprefix>=<metric_name>)` where the searchprefix is 'neo4j.metrics:name'
 and the metric_name name has a few variations and depends on the following: 
- If it's a "global" or "database" metric (global meaning the entire dbms in this context)
- What `metrics.prefix` is set to in neo4j.conf (default is neo4j)
- If `metrics.namespaces.enabled` is true of false in neo4j.conf (this setting was introduced when multidb was added)

An example - The `store.size.total` metric, which is a "database" metric, with namespaces.enabled=false and prefix unset:
neo4j.neo4j.store.size.total 

Full query:
CALL dbms.queryJmx("neo4j.metrics:name=neo4j.neo4j.store.size.total")

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
    baseMetricNames: ['store.size.total']
  },
  {
    group: 'Page cache',
    type: 'dbms',
    baseMetricNames: [
      'page_cache.flushes',
      'page_cache.evictions',
      'page_cache.eviction_exceptions',
      'page_cache.hit_ratio',
      'page_cache.usage_ratio'
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
      'transaction.active',
      'transaction.peak_concurrent',
      'transaction.started',
      'transaction.committed'
    ]
  }
]

type MetricType = 'database' | 'dbms'
type GetFullMetricNameParams = {
  baseMetricName: string
  type: MetricType
  group: string
}
class MetricsQueryBuilder {
  databaseName: string
  namespacesEnabled: boolean
  userConfiguredPrefix: string

  constructor(
    databaseName: string,
    namespacesEnabled: boolean,
    userConfiguredPrefix: string
  ) {
    this.databaseName = databaseName
    this.namespacesEnabled = namespacesEnabled
    this.userConfiguredPrefix = userConfiguredPrefix
  }

  getFullMetricName = ({
    baseMetricName,
    type,
    group
  }: GetFullMetricNameParams) => {
    // Build full metric name of format:
    // <user-configured-prefix>.[namespace?].[databaseName?].<metric-name>
    const parts = [this.userConfiguredPrefix]
    if (this.namespacesEnabled) {
      parts.push(type)
    }

    if (type === 'database') {
      parts.push(this.databaseName)
    }

    parts.push(baseMetricName)
    const fullMetricName = parts.join('.')

    return `CALL dbms.queryJmx("neo4j.metrics:name=${fullMetricName}") YIELD name, attributes RETURN "${group}" AS group, name, attributes`
  }

  getSysInfoQuery = () => {
    //const sysInfoMetrics.map(({ group, type, baseMetricNames }) => {
    //})
  }
}

const jmxPrefix = 'neo4j.metrics:name='
export const sysinfoQuery = (useDb?: string | null): string => `
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

export const responseHandler = (
  setState: (newState: any) => void,
  useDb?: string | null
) =>
  function(res: any): void {
    if (!res || !res.result || !res.result.records) {
      setState({ success: false })
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
          name: record.get('name').replace(jmxPrefix, ''),
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
        mapper: (v: number) => `${(v * 100).toFixed(2)}%`,
        optional: true
      },
      {
        label: 'Usage Ratio',
        value: cache['neo4j.page_cache.usage_ratio'],
        mapper: (v: number) => `${(v * 100).toFixed(2)}%`,
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
