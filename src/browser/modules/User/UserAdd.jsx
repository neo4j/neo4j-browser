import React from 'react'
import uuid from 'uuid'
import { connect } from 'react-redux'
import { getListOfUsersWithRole, getListOfRolesWithUsers, createDatabaseUser } from './boltUserHelper'
import UserDetails from './UserDetails'
import bolt from 'services/bolt/bolt'
import {H3} from 'nbnmui/headers'

import FrameTitlebar from '../Stream/FrameTitlebar'
import FrameTemplate from '../Stream/FrameTemplate'

export class UserAdd extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      UserAdd: this.props.users,
      listRoles: this.props.roles,
      username: '',
      password: '',
      forcePasswordChange: false
    }
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  UserAdd () {
    return getListOfUsersWithRole((r) => {
      return this.setState({UserAdd: this.extractUserNameAndRolesFromBolt(r)})
    })
  }
  listRoles () {
    getListOfRolesWithUsers((r) => {
      return this.setState({listRoles: this.extractUserNameAndRolesFromBolt(r)})
    })
  }
  makeTable (data) {
    const items = data.map((row) => {
      return (
        <UserDetails key={uuid.v4()} username={row[0]} roles={row[1]} callback={() => this.UserAdd()} />
      )
    })
    return (
      <table>
        <thead><tr><th>Username</th><th>Role(s)</th></tr></thead>
        <tbody>{items}</tbody>
      </table>
    )
  }
  componentWillMount () {
    this.UserAdd()
    this.listRoles()
  }
  createUser () {
    createDatabaseUser(this.state, (r) => { this.UserAdd() })
  }
  updateUsername (event) {
    return this.setState({username: event.target.value})
  }
  updatePassword (event) {
    return this.setState({password: event.target.value})
  }
  updateForcePasswordChange (event) {
    return this.setState({forcePasswordChange: !this.state.forcePasswordChange})
  }
  render () {
    const listRoles = this.state.listRoles
    const listOfAvailableRoles = (listRoles == null) ? '-'
      : <span className='roles'>{listRoles.join(', ')}</span>
    const frameContents = (
      <div>
        <H3>
          Add new users
        </H3>
        {listOfAvailableRoles}
        Username: <input onChange={this.updateUsername.bind(this)} />
        Password: <input onChange={this.updatePassword.bind(this)} type='password' />
        Force password change: <input onChange={this.updateForcePasswordChange.bind(this)} type='checkbox' />
        <button onClick={this.createUser.bind(this)}>Add User</button>
      </div>
    )
    return (
      <FrameTemplate
        header={<FrameTitlebar frame={this.props.frame} />}
        contents={frameContents}
      />
    )
  }
}

export default connect(null, null)(UserAdd)
