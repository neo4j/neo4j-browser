import React from 'react'
import uuid from 'uuid'
import { connect } from 'react-redux'
import { getListOfUsersWithRole, getListOfRolesWithUsers, createDatabaseUser } from './boltUserHelper'
import { UserDetailsComponent } from './UserDetails'
import bolt from '../../../../services/bolt/bolt'

export class ListUsersComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      listUsers: this.props.users,
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
  listUsers () {
    return getListOfUsersWithRole((r) => {
      const result = this.extractUserNameAndRolesFromBolt(r)
      return this.setState({listUsers: result})
    })
  }
  listRoles () {
    getListOfRolesWithUsers((r) => {
      const result = this.extractUserNameAndRolesFromBolt(r)
      return this.setState({listRoles: result})
    })
  }
  makeTable (data) {
    const items = data.map((row) => {
      return (
        <UserDetailsComponent key={uuid.v4()} username={row[0]} roles={row[1]} callback={() => this.listUsers()} />
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
    this.listUsers()
    this.listRoles()
  }
  createUser () {
    createDatabaseUser(this.state, (r) => { this.listUsers() })
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
    const listUsers = this.state.listUsers
    const listRoles = this.state.listRoles
    const renderedListOfUsers = (listUsers == null) ? 'No users' : this.makeTable(listUsers)
    const renderedListOfRoles = (listRoles == null) ? 'No roles' : JSON.stringify(listRoles)
    const listOfAvailableRoles = (listRoles == null) ? '-' : listRoles.map((i)=>{ return i[0]}).join(', ')
    return (
      <div className='db-list-users'>
        <div>
          <h3>List by username ({listOfAvailableRoles})</h3>
          {renderedListOfUsers}
        </div>
        <div>
          <h3>Add new users</h3>
          Username: <input onChange={this.updateUsername.bind(this)} />
          Password: <input onChange={this.updatePassword.bind(this)} type='password' />
          Force password change: <input onChange={this.updateForcePasswordChange.bind(this)} type='checkbox' />
          <button onClick={() => { this.createUser() }}>Add User</button>
        </div>
      </div>
    )
  }
}

const ListUsers = connect(null, null)(ListUsersComponent)
export default ListUsers
