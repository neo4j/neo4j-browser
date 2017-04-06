import { Component } from 'preact'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {DrawerSubHeader, DrawerSection, DrawerSectionBody} from 'browser-components/drawer'
import {StyledTable, StyledKey, StyledValue} from './styled'

export class UserDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userDetails: props.userDetails || {}
    }
  }
  componentWillReceiveProps (props) {
    this.props.bus.self(
      CYPHER_REQUEST,
      { query: 'CALL dbms.security.showCurrentUser()' },
      (response) => {
        if (!response.success) return
        const result = response.result
        this.setState({
          userDetails: {
            username: result.records[0].get('username'),
            roles: result.records[0].get('roles')
          }
        })
      }
    )
  }
  render () {
    const userDetails = this.state.userDetails
    if (userDetails.username) {
      const mappedRoles = (userDetails.roles.length > 0) ? userDetails.roles.join(', ') : '-'
      const showAdminFunctionality = (userDetails.roles.includes('ADMIN')) ? <div className='user-list-button'>:server user add</div> : null
      return (
        <DrawerSection className='user-details'>
          <DrawerSubHeader>Connected as</DrawerSubHeader>
          <DrawerSectionBody>
            <StyledTable>
              <tbody>
                <tr>
                  <StyledKey>Username:</StyledKey><StyledValue>{userDetails.username}</StyledValue>
                </tr>
                <tr>
                  <StyledKey>Roles:</StyledKey><StyledValue>{mappedRoles}</StyledValue>
                </tr>
              </tbody>
            </StyledTable>
            {showAdminFunctionality}
          </DrawerSectionBody>
        </DrawerSection>
      )
    } else {
      return null
    }
  }
}
export default withBus(UserDetails)
