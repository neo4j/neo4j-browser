import React from 'react'
import { buildTableData, buildDatabaseTable } from './sysinfo-utils'
import {
  SysInfoTableContainer,
  StyledSysInfoTable
} from 'browser-components/Tables'
import { StyledInfoMessage } from './../../Stream/styled'
import { Database } from 'shared/modules/dbMeta/dbMetaDuck'
import { DatabaseMetric } from './SysInfoFrame'

type SysInfoFrameProps = {
  databases: Database[]
  storeSizes: DatabaseMetric[]
  idAllocation: DatabaseMetric[]
  pageCache: DatabaseMetric[]
  transactions: DatabaseMetric[]
  isEnterpriseEdition: boolean
}

export const SysInfoTable = ({
  databases,
  pageCache,
  storeSizes,
  idAllocation,
  transactions,
  isEnterpriseEdition
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
      {buildDatabaseTable(mappedDatabases)}
    </SysInfoTableContainer>
  ) : (
    <div>
      <StyledInfoMessage>
        Complete sysinfo is available only in Neo4j Enterprise Edition.
      </StyledInfoMessage>
      <SysInfoTableContainer>
        {buildDatabaseTable(mappedDatabases)}
      </SysInfoTableContainer>
    </div>
  )
}
