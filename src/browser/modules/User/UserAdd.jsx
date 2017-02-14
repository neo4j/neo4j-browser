import React from 'react'
import uuid from 'uuid'
import { connect } from 'react-redux'
import { getListOfUsersWithRole, getListOfRolesWithUsers, createDatabaseUser } from './boltUserHelper'
import UserInformation from './UserInformation'
import bolt from 'services/bolt/bolt'
import {H3} from 'nbnmui/headers'

import RolesSelector from './RolesSelector'
import FrameTemplate from '../Stream/FrameTemplate'

export class UserAdd extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userAdd: this.props.users,
      availableRoles: this.props.availableRoles,
      roles: this.props.roles || [],
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
  userAdd () {
    return getListOfUsersWithRole((r) => {
      return this.setState({userAdd: this.extractUserNameAndRolesFromBolt(r)})
    })
  }
  listRoles () {
    getListOfRolesWithUsers((r) => {
      console.log('r', this.extractUserNameAndRolesFromBolt(r))
      const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
      return this.setState({availableRoles: flatten(this.extractUserNameAndRolesFromBolt(r))})
    })
  }
  makeTable (data) {
    const items = data.map((row) => {
      return (
        <UserInformation key={uuid.v4()} username={row[0]} roles={row[1]} callback={() => this.userAdd()} />
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
    this.userAdd()
    this.listRoles()
  }
  createUser () {
    createDatabaseUser(this.state, (r) => { this.userAdd() })
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
    const listRoles = this.state.availableRoles
    const listOfAvailableRoles = (listRoles)
      ? (<RolesSelector roles={listRoles} onChange={({option}) => {
        this.setState({roles: this.state.roles.concat([option])})
      }} />)
      : '-'
    const frameContents = (
      <div>
        <H3>
          Add new users
        </H3>
        Roles: {this.state.roles.join(',')} {listOfAvailableRoles}
        Username: <input onChange={this.updateUsername.bind(this)} />
        Password: <input onChange={this.updatePassword.bind(this)} type='password' />
        Force password change: <input onChange={this.updateForcePasswordChange.bind(this)} type='checkbox' />
        <button onClick={this.createUser.bind(this)}>Add User</button>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
      />
    )
  }
}

export default connect(null, null)(UserAdd)
