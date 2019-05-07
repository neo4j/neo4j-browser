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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import {
  getVersion,
  getEdition,
  getDbName,
  getStoreSize,
  getClusterRole
} from 'shared/modules/dbMeta/dbMetaDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { toHumanReadableBytes } from 'services/utils'

import Render from 'browser-components/Render'
import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer'
import {
  StyledTable,
  StyledKey,
  StyledValue,
  StyledValueUCFirst,
  Link
} from './styled'

export const DatabaseKernelInfo = ({
  role,
  version,
  edition,
  dbName,
  storeSize,
  onItemClick
}) => {
  return (
    <DrawerSection className='database-kernel-info'>
      <DrawerSubHeader>DBMS</DrawerSubHeader>
      <DrawerSectionBody>
        <StyledTable>
          <tbody>
            <Render if={role}>
              <tr>
                <StyledKey>Cluster role: </StyledKey>
                <StyledValue>{role}</StyledValue>
              </tr>
            </Render>
            <Render if={version}>
              <tr>
                <StyledKey>Version: </StyledKey>
                <StyledValue>{version}</StyledValue>
              </tr>
            </Render>
            <Render if={edition}>
              <tr>
                <StyledKey>Edition: </StyledKey>
                <StyledValueUCFirst>{edition}</StyledValueUCFirst>
              </tr>
            </Render>
            <Render if={dbName}>
              <tr>
                <StyledKey>Name: </StyledKey>
                <StyledValue>{dbName}</StyledValue>
              </tr>
            </Render>
            <Render if={storeSize}>
              <tr>
                <StyledKey>Size: </StyledKey>
                <StyledValue>{toHumanReadableBytes(storeSize)}</StyledValue>
              </tr>
            </Render>
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

const mapStateToProps = store => {
  return {
    version: getVersion(store),
    edition: getEdition(store),
    dbName: getDbName(store),
    storeSize: getStoreSize(store),
    role: getClusterRole(store)
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DatabaseKernelInfo)
)
