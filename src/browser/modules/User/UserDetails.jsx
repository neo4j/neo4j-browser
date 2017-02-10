import React from 'react'
import { deleteUser, addUserToRole } from './boltUserHelper'

let removeClick = null
export class UserDetails extends React.Component {
  constructor (props) {
    super(props)
    this.state = {edit: false, roles: this.props.roles, username: this.props.username}
    if (this.props.onRemoveClick) {
      removeClick = this.props.onRemoveClick
    } else {
      removeClick = (username) => {
        deleteUser(username, (r) => { return this.props.callback() })
      }
    }
  }
  render () {
    return (
      <tr className='user-info'>
        <td className='username'>{this.props.username}</td>
        <td className='roles'>
          Role: <input className='role' defaultValue={this.state.roles} onChange={(event) => { this.setState(Object.assign(this.state, { roles: event.target.value })) }} />
          <button onClick={() => {
            addUserToRole(this.state.username, this.state.roles, (r) => { this.props.callback() })
          }}>Save</button>
        </td>
        <td className='delete'>
          <button onClick={() => {
            removeClick(this.props.username)
          }}>Remove</button>
        </td>
      </tr>
    )
  }
}

export default UserDetails
