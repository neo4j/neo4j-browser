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

import { QuestionIcon } from 'browser-components/icons/LegacyIcons'

import { buildTableData } from './sysinfoUtils'
import {
  StyledSysInfoTable,
  SysInfoTableContainer,
  SysInfoTableEntry
} from 'browser-components/Tables'
import arrayHasItems from 'shared/utils/array-has-items'

export const SysInfoDisplay = ({
  storeSizes,
  idAllocation,
  pageCache,
  transactions,
  isOnCluster,
  cc,
  ha,
  haInstances
}: any): JSX.Element => {
  return (
    <SysInfoTableContainer>
      <StyledSysInfoTable key="StoreSizes" header="Store Sizes">
        {buildTableData(storeSizes)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="IDAllocation" header="ID Allocation">
        {buildTableData(idAllocation)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="PageCache" header="Page Cache">
        {buildTableData(pageCache)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="Transactionss" header="Transactions">
        {buildTableData(transactions)}
      </StyledSysInfoTable>
      {isOnCluster && (
        <StyledSysInfoTable
          key="cc-table"
          header={
            <span data-testid="sysinfo-cluster-members-title">
              Cluster Members{' '}
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
        </StyledSysInfoTable>
      )}
      {arrayHasItems(ha) && (
        <StyledSysInfoTable key="ha-table" header="High Availability">
          {buildTableData(ha)}
        </StyledSysInfoTable>
      )}
      {arrayHasItems(haInstances) && (
        <StyledSysInfoTable key="cluster-table" header="Cluster" colspan="4">
          <SysInfoTableEntry
            key="ha-entry"
            headers={['Id', 'Alive', 'Available', 'Is Master']}
          />
          {buildTableData(haInstances)}
        </StyledSysInfoTable>
      )}
    </SysInfoTableContainer>
  )
}
