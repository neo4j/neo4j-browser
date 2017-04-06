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
