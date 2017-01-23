import React from 'react'
import bolt from 'services/bolt/bolt'

export class UserDetails extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userDetails: props.userDetails
    }
  }
  componentWillReceiveProps (props) {
    bolt.transaction('CALL dbms.security.showCurrentUser()').then(r => {
      this.setState({
        userDetails: {
          username: r.records[0].get('username'),
          roles: r.records[0].get('roles')
        }
      })
    }).catch(_ => console.log('CALL dbms.security.showCurrentUser() failed', _))
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
