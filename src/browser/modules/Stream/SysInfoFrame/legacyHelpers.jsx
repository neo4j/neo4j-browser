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
  getTableDataFromRecords,
  mapLegacySysInfoRecords,
  buildTableData
} from './sysinfo-utils'
import { toHumanReadableBytes, toKeyString } from 'services/utils'
import arrayHasItems from 'shared/utils/array-has-items'
import Render from 'browser-components/Render'
import {
  SysInfoTableContainer,
  SysInfoTable,
  SysInfoTableEntry
} from 'browser-components/Tables'
import { QuestionIcon } from 'browser-components/icons/Icons'

export const sysinfoQuery = () => 'CALL dbms.queryJmx("org.neo4j:*")'

export const Sysinfo = ({
  storeSizes,
  idAllocation,
  pageCache,
  transactions,
  isACausalCluster,
  cc,
  ha,
  haInstances
}) => {
  return (
    <SysInfoTableContainer>
      <SysInfoTable key="StoreSizes" header="Store Sizes">
        {buildTableData(storeSizes)}
      </SysInfoTable>
      <SysInfoTable key="IDAllocation" header="ID Allocation">
        {buildTableData(idAllocation)}
      </SysInfoTable>
      <SysInfoTable key="PageCache" header="Page Cache">
        {buildTableData(pageCache)}
      </SysInfoTable>
      <SysInfoTable key="Transactionss" header="Transactions">
        {buildTableData(transactions)}
      </SysInfoTable>
      <Render if={isACausalCluster}>
        <SysInfoTable
          key="cc-table"
          header={
            <span data-testid="sysinfo-casual-cluster-members-title">
              Causal Cluster Members{' '}
              <QuestionIcon title="Values shown in `:sysinfo` may differ between cluster members" />
            </span>
          }
          colspan="5"
        >
          <SysInfoTableEntry
            key="cc-entry"
            headers={['Roles', 'Addresses', 'Groups', 'Database', 'Actions']}
          />
          {buildTableData(cc)}
        </SysInfoTable>
      </Render>
      <Render if={arrayHasItems(ha)}>
        <SysInfoTable key="ha-table" header="High Availability">
          {buildTableData(ha)}
        </SysInfoTable>
      </Render>
      <Render if={arrayHasItems(haInstances)}>
        <SysInfoTable key="cluster-table" header="Cluster" colspan="4">
          <SysInfoTableEntry
            key="ha-entry"
            headers={['Id', 'Alive', 'Available', 'Is Master']}
          />
          {buildTableData(haInstances)}
        </SysInfoTable>
      </Render>
    </SysInfoTableContainer>
  )
}

export const responseHandler = setState =>
  function(res) {
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
      const instancesInCluster = ha.InstancesInCluster.map(({ properties }) => {
        return [
          properties.instanceId,
          properties.alive.toString(),
          properties.available.toString(),
          properties.haRole === 'master' ? 'yes' : '-'
        ]
      })

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

export const clusterResponseHandler = setState =>
  function(res) {
    if (!res.success) {
      setState({ error: 'No causal cluster results', success: false })
      return
    }
    const mappedResult = mapLegacySysInfoRecords(res.result.records)
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
        (ccRecord.groups || []).join(', '),
        ccRecord.database,
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
