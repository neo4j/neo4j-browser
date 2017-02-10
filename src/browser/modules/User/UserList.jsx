import React from 'react'
import uuid from 'uuid'
import { connect } from 'react-redux'
import { getListOfUsersWithRole, getListOfRolesWithUsers, createDatabaseUser } from './boltUserHelper'
import UserDetails from './UserDetails'
import bolt from 'services/bolt/bolt'
import {H3} from 'nbnmui/headers'

import FrameTitlebar from '../Stream/FrameTitlebar'
import FrameTemplate from '../Stream/FrameTemplate'

export class UserList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userList: this.props.users,
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
  userList () {
    return getListOfUsersWithRole((r) => {
      return this.setState({userList: this.extractUserNameAndRolesFromBolt(r)})
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
        <UserDetails key={uuid.v4()} username={row[0]} roles={row[1]} callback={this.userList.bind(this)} />
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
    this.userList()
    this.listRoles()
  }
  createUser () {
    createDatabaseUser(this.state, (r) => { this.userList() })
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
    const userList = this.state.userList
    const listRoles = this.state.listRoles
    const renderedListOfUsers = (userList == null) ? 'No users' : this.makeTable(userList)
    const listOfAvailableRoles = (listRoles == null) ? '-'
      : <span className='roles'>{listRoles.join(', ')}</span>
    const frameContents = (
      <div className='db-list-users'>
        <div>
          <H3>
            List by username {listOfAvailableRoles}
          </H3>
          {renderedListOfUsers}
        </div>
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

export default connect(null, null)(UserList)
