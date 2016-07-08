import React from 'react'
import { deleteUser } from './boltUserHelper'

let click = null
export class UserDetailsComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {visible: true}
    if (this.props.onRemoveClick) {
      click = this.props.onRemoveClick
    } else {
      click = (username) => {
        deleteUser(username, (r) => { return this.props.callBack() })
      }
    }
  }
  render () {
    if (this.state.visible) {
      return (
        <tr className='user-info'>
          <td className='username'>{this.props.username}</td>
          <td className='roles'>{this.props.roles}</td>
          <td>
            <button onClick={() => {
              click(this.props.username)
            }}>Remove</button>
          </td>
        </tr>
      )
    } else {
      return null
    }
  }
}
