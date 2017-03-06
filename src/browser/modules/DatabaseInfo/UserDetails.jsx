import { Component } from 'preact'
import { withBus } from 'react-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

export class UserDetails extends Component {
  constructor (props) {
    super(props)
    this.state = {
      userDetails: props.userDetails
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
    if (userDetails) {
      const mappedRoles = (userDetails.roles.length > 0) ? userDetails.roles.join(', ') : '-'
      const showAdminFunctionality = (userDetails.roles.includes('ADMIN')) ? <div className='user-list-button'>:server user add</div> : null
      return (
        <div className='user-details'>
          <h4>Connected as</h4>
          <div>Username: <span className='username'>{userDetails.username}</span></div>
          <div>Roles: <span className='roles'>{mappedRoles}</span></div>
          {showAdminFunctionality}
        </div>
      )
    } else {
      return null
    }
  }
}
export default withBus(UserDetails)
