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

import { Component } from 'preact'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

import {DrawerSection, DrawerSectionBody, DrawerSubHeader} from 'browser-components/drawer'
import {StyledTable, StyledKey, StyledValue} from './styled'

export class DatabaseKernelInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      databaseKernelInfo: props.databaseKernelInfo
    }
  }
  componentWillReceiveProps (props) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: 'CALL dbms.components()'},
      (response) => {
        if (response.success) {
          const result = response.result
          this.setState({
            databaseKernelInfo: {
              version: result.records[0].get('versions'),
              edition: result.records[0].get('edition')
            }
          })
        }
      }
    )
  }
  render () {
    const databaseKernelInfo = this.state.databaseKernelInfo
    if (databaseKernelInfo) {
      return (
        <DrawerSection className='database-kernel-info'>
          <DrawerSubHeader>Database</DrawerSubHeader>
          <DrawerSectionBody>
            <StyledTable>
              <tbody>
                <tr>
                  <StyledKey>Version: </StyledKey><StyledValue>{databaseKernelInfo.version}</StyledValue>
                </tr>
                <tr>
                  <StyledKey>Edition: </StyledKey><StyledValue>{databaseKernelInfo.edition}</StyledValue>
                </tr>
              </tbody>
            </StyledTable>
          </DrawerSectionBody>
        </DrawerSection>
      )
    } else {
      return null
    }
  }
}
export default withBus(DatabaseKernelInfo)
