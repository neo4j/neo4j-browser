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

import {
  getTableDataFromRecords,
  mapLegacySysInfoRecords
} from './sysinfoUtils'
import { toHumanReadableBytes } from 'services/utils'

export const sysinfoQuery = () => 'CALL dbms.queryJmx("org.neo4j:*")'

export const responseHandler = (setState: any) =>
  function (res: any) {
    if (!res.success) {
      setState({ error: 'No results', success: false })
      return
    }
    const {
      ha,
      kernel = {},
      cache = {},
      tx = {},
      primitive = {}
    } = getTableDataFromRecords(res.result.records)

    if (ha) {
      const instancesInCluster = ha.InstancesInCluster.map(
        ({ properties }: any) => {
          return [
            properties.instanceId,
            properties.alive.toString(),
            properties.available.toString(),
            properties.haRole === 'master' ? 'yes' : '-'
          ]
        }
      )

      setState({
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
        mapper: (v: any) => `${(v * 100).toFixed(2)}%`,
        optional: true
      },
      {
        label: 'Usage Ratio',
        value: cache.UsageRatio,
        mapper: (v: any) => `${(v * 100).toFixed(2)}%`,
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

    setState({
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

export const clusterResponseHandler = (setState: any) =>
  function (res: any) {
    if (!res.success) {
      setState({ error: 'No cluster results', success: false })
      return
    }
    const mappedResult = mapLegacySysInfoRecords(res.result.records)
    const mappedTableComponents = mappedResult.map((ccRecord: any) => {
      const httpUrlForMember = ccRecord.addresses.filter((address: any) => {
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
        (ccRecord.groups || []).join(', '),
        ccRecord.database,
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
    setState({ cc: [{ value: mappedTableComponents }], success: true })
  }
