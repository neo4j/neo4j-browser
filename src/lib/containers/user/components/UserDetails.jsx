import React from 'react'
import bolt from '../../../../services/bolt/bolt'

let click = null
export class UserDetailsComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {visible: true}
    if (this.props.onRemoveClick) {
      click = this.props.onRemoveClick
    } else {
      click = (username) => {
        Promise.resolve(bolt.transaction('CALL dbms.deleteUser("' + username + '")'))
          .then((r) => {
            return this.setState({visible: false})
          }
        )
      }
    }
  }
  render () {
    if (this.state.visible) {
      return (
        <tr className='user-info'>
          <td className='username'>{this.props.username}</td>
          <td className='roles'>{this.props.roles}</td>
          <td><button onClick={() => {
            click(this.props.username)
          }}>Remove</button></td>
        </tr>
      )
    } else {
      return null
    }
  }
}
