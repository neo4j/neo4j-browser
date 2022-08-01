import React from 'react'

import { QuestionIcon } from 'browser-components/icons/LegacyIcons'

import { StyledInfoMessage } from './../../Stream/styled'
import { DatabaseMetric } from './SysInfoFrame'
import { buildDatabaseTable, buildTableData } from './sysinfoUtils'
import {
  StyledSysInfoTable,
  SysInfoTableContainer,
  SysInfoTableEntry
} from 'browser-components/Tables'
import { Database } from 'shared/modules/dbMeta/dbMetaDuck'

type SysInfoFrameProps = {
  databases: Database[]
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
  clusterMembers: DatabaseMetric[]
  isEnterpriseEdition: boolean
  hasMultiDbSupport: boolean
}

export const SysInfoTable = ({
  databases,
  pageCache,
  storeSizes,
  idAllocation,
  transactions,
  isEnterpriseEdition,
  clusterMembers,
  hasMultiDbSupport
}: SysInfoFrameProps): JSX.Element => {
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

  return isEnterpriseEdition ? (
    <SysInfoTableContainer>
      <StyledSysInfoTable key="StoreSize" header="Store Size" colspan={2}>
        {buildTableData(storeSizes)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="IDAllocation" header="Id Allocation">
        {buildTableData(idAllocation)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="PageCache" header="Page Cache">
        {buildTableData(pageCache)}
      </StyledSysInfoTable>
      <StyledSysInfoTable key="Transactions" header="Transactions">
        {buildTableData(transactions)}
      </StyledSysInfoTable>
      {hasMultiDbSupport && buildDatabaseTable(mappedDatabases)}
      {clusterMembers.length > 0 && (
        <StyledSysInfoTable
          key="cc-table"
          header={
            <span data-testid="sysinfo-cluster-members-title">
              Cluster Members{' '}
              <QuestionIcon title="Values shown in `:sysinfo` may differ between cluster members" />
            </span>
          }
          colspan="3"
        >
          <SysInfoTableEntry
            key="cc-entry"
            headers={['Roles', 'Addresses', 'Actions']}
          />
          {buildTableData(clusterMembers)}
        </StyledSysInfoTable>
      )}
    </SysInfoTableContainer>
  ) : (
    <div>
      <StyledInfoMessage>
        Complete sysinfo is available only in Neo4j Enterprise Edition.
      </StyledInfoMessage>
      <SysInfoTableContainer>
        {hasMultiDbSupport && buildDatabaseTable(mappedDatabases)}
      </SysInfoTableContainer>
    </div>
  )
}
