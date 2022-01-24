import React from 'react'

import { buildTableData } from './sysinfo-utils'
import {
  StyledSysInfoTable,
  SysInfoTableContainer,
  SysInfoTableEntry
} from 'browser-components/Tables'
import { QuestionIcon } from 'browser-components/icons/Icons'
import arrayHasItems from 'shared/utils/array-has-items'

export const SysInfoDisplay = ({
  storeSizes,
  idAllocation,
  pageCache,
  transactions,
  isACausalCluster,
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
      {isACausalCluster && (
        <StyledSysInfoTable
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
