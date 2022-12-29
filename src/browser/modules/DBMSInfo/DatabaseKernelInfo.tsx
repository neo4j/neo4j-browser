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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'

import {
  Link,
  StyledKey,
  StyledTable,
  StyledValue,
  StyledValueUCFirst
} from './styled'
import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { toHumanReadableBytes } from 'services/utils'
import {
  commandSources,
  executeCommand,
  listDbsCommand
} from 'shared/modules/commands/commandsDuck'
import {
  Database,
  getClusterRoleForDb,
  getDatabases,
  getEdition,
  getStoreSize,
  getRawVersion
} from 'shared/modules/dbMeta/dbMetaDuck'
import { getUsedDbName } from 'shared/modules/features/versionedFeatures'

type DatabaseKernelInfo = {
  role: any
  version: string | null
  edition: string | null
  dbName: any
  storeSize: any
  onItemClick: any
  databases: Database[]
}
export const DatabaseKernelInfo = ({
  role,
  version,
  edition,
  dbName,
  storeSize,
  onItemClick,
  databases
}: DatabaseKernelInfo) => {
  return (
    <DrawerSection className="database-kernel-info">
      <DrawerSubHeader>DBMS</DrawerSubHeader>
      <DrawerSectionBody>
        <StyledTable>
          <tbody>
            {role && (
              <tr>
                <StyledKey>Cluster role: </StyledKey>
                <StyledValue>{role}</StyledValue>
              </tr>
            )}
            {version && (
              <tr>
                <StyledKey>Version: </StyledKey>
                <StyledValue>{version}</StyledValue>
              </tr>
            )}
            {edition && (
              <tr>
                <StyledKey>Edition: </StyledKey>
                <StyledValueUCFirst>{edition}</StyledValueUCFirst>
              </tr>
            )}
            {dbName && (
              <tr>
                <StyledKey>Name: </StyledKey>
                <StyledValue>{dbName}</StyledValue>
              </tr>
            )}
            {storeSize && (
              <tr>
                <StyledKey>Size: </StyledKey>
                <StyledValue>{toHumanReadableBytes(storeSize)}</StyledValue>
              </tr>
            )}
            {databases && databases.length > 0 && (
              <tr>
                <StyledKey>Databases: </StyledKey>
                <StyledValue>
                  <Link onClick={() => onItemClick(`:${listDbsCommand}`)}>
                    :{listDbsCommand}
                  </Link>
                </StyledValue>
              </tr>
            )}
            <tr>
              <StyledKey>Information: </StyledKey>
              <StyledValue>
                <Link onClick={() => onItemClick(':sysinfo')}>:sysinfo</Link>
              </StyledValue>
            </tr>
            <tr>
              <StyledKey>Query List: </StyledKey>
              <StyledValue>
                <Link onClick={() => onItemClick(':queries')}>:queries</Link>
              </StyledValue>
            </tr>
          </tbody>
        </StyledTable>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

const mapStateToProps = (state: any) => {
  const dbName = getUsedDbName(state)
  return {
    version: getRawVersion(state),
    edition: getEdition(state),
    dbName,
    storeSize: getStoreSize(state),
    role: getClusterRoleForDb(state, dbName),
    databases: getDatabases(state)
  }
}
const mapDispatchToProps = (_dispatch: any, ownProps: any) => {
  return {
    onItemClick: (cmd: any) => {
      const action = executeCommand(cmd, { source: commandSources.button })
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(
  connect(mapStateToProps, mapDispatchToProps)(DatabaseKernelInfo)
)
