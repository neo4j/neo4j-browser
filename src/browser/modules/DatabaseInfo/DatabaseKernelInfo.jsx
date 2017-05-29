/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { getVersion, getEdition } from 'shared/modules/dbMeta/dbMetaDuck'
import { executeCommand } from 'shared/modules/commands/commandsDuck'

import Render from 'browser-components/Render'
import {DrawerSection, DrawerSectionBody, DrawerSubHeader} from 'browser-components/drawer'
import {StyledTable, StyledKey, StyledValue, StyledValueUCFirst, Link} from './styled'

export const DatabaseKernelInfo = ({version, edition, onItemClick}) => {
  return (
    <DrawerSection className='database-kernel-info'>
      <DrawerSubHeader>Database</DrawerSubHeader>
      <DrawerSectionBody>
        <StyledTable>
          <tbody>
            <Render if={version}>
              <tr>
                <StyledKey>Version: </StyledKey><StyledValue>{version}</StyledValue>
              </tr>
            </Render>
            <Render if={edition}>
              <tr>
                <StyledKey>Edition: </StyledKey><StyledValueUCFirst>{edition}</StyledValueUCFirst>
              </tr>
            </Render>
            <tr>
              <StyledKey>Information: </StyledKey><StyledValue><Link onClick={() => onItemClick(':sysinfo')}>:sysinfo</Link></StyledValue>
            </tr>
            <tr>
              <StyledKey>Query List: </StyledKey><StyledValue><Link onClick={() => onItemClick(':queries')}>:queries</Link></StyledValue>
            </tr>
          </tbody>
        </StyledTable>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

const mapStateToProps = (store) => {
  return {
    version: getVersion(store),
    edition: getEdition(store)
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd) => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(DatabaseKernelInfo))
