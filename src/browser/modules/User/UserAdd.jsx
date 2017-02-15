import React from 'react'
import {v4} from 'uuid'

import { getListOfUsersWithRole, getListOfRolesWithUsers, createDatabaseUser, addRoleToUser } from './boltUserHelper'
import bolt from 'services/bolt/bolt'
import Table from 'grommet/components/Table'
import TableHeader from 'grommet/components/TableHeader'
import Button from 'grommet/components/Button'
import TextInput from 'grommet/components/TextInput'
import Notification from 'grommet/components/Notification'
import CloseIcon from 'grommet/components/icons/base/Close'

import RolesSelector from './RolesSelector'
import FrameTemplate from '../Stream/FrameTemplate'

export class UserAdd extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userAdd: this.props.users,
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: '',
      password: '',
      confirmPassword: '',
      forcePasswordChange: false,
      errors: null
    }
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  listRoles () {
    return this.state.roles.map((role) => {
      return (
        <Button key={v4()} label={role} icon={<CloseIcon />} onClick={(t) => {
          const thingy = this.state.roles.slice().splice(1, this.state.roles.indexOf(role))
          this.setState({roles: thingy})
        }} />
      )
    })
  }
  userAdd () {
    return getListOfUsersWithRole((r) => {
      const createdUser = this.extractUserNameAndRolesFromBolt(r).filter((user) => {
        return user[0] === this.state.username
      })
      this.setState({userAdd: createdUser})
      return this.addRoles()
    })
  }
  addRoles () {
    this.state.roles.forEach((role) => {
      addRoleToUser(this.state.username, role, (r) => { this.props.callback() })
    })
  }
  getRoles () {
    getListOfRolesWithUsers((r) => {
      const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
      this.setState({availableRoles: flatten(this.extractUserNameAndRolesFromBolt(r))})
    })
  }
  componentWillMount () {
    this.getRoles()
  }
  createUser () {
    let errors = []
    if (!this.state.username) errors.push('Missing username')
    if (!this.state.password) errors.push('Missing password')
    if (!(this.state.password === this.state.confirmPassword)) errors.push('Passwords are not the same')
    if (errors.length !== 0) {
      return this.setState({errors: errors})
    } else {
      this.setState({errors: null})
      return this.createNewUser()
    }
  }
  createNewUser () {
    createDatabaseUser(this.state, this.userAdd.bind(this))
  }
  updateUsername (event) {
    return this.setState({username: event.target.value})
  }
  updatePassword (event) {
    return this.setState({password: event.target.value})
  }
  confirmUpdatePassword (event) {
    return this.setState({confirmPassword: event.target.value})
  }
  updateForcePasswordChange (event) {
    return this.setState({forcePasswordChange: !this.state.forcePasswordChange})
  }
  availableRoles () {
    return this.state.availableRoles.filter(role => this.state.roles.indexOf(role) < 0)
  }
  render () {
    const listOfAvailableRoles = (this.state.availableRoles) ? (<RolesSelector roles={this.availableRoles()} onChange={({option}) => { this.setState({roles: this.state.roles.concat([option])}) }} />) : '-'
    const frameContents = (
      <div>
        <Table>
          <TableHeader labels={['Username', 'Roles(s)', 'Set Password', 'Confirm Password', 'Force Password Change']} />
          <tbody>
            <tr>
              <td>
                <TextInput className='username' onDOMChange={this.updateUsername.bind(this)} />
              </td>
              <td>
                {this.listRoles()}{listOfAvailableRoles}
              </td>
              <td>
                <TextInput onDOMChange={this.updatePassword.bind(this)} type='password' />
              </td>
              <td>
                <TextInput onDOMChange={this.confirmUpdatePassword.bind(this)} type='password' />
              </td>
              <td>
                <TextInput onDOMChange={this.updateForcePasswordChange.bind(this)} type='checkbox' />
              </td>
            </tr>
            <tr>
              <td>
                <Button onClick={this.createUser.bind(this)} label='Add User' />
              </td>
            </tr>
          </tbody>
        </Table>
        {this.state.errors == null ? null : <Notification status='warning' state={this.state.errors.join(', ')} message='Form not complete' />}
        {this.state.success ? <Notification status='ok' state={this.state.userAdd.username} message='User created' /> : null}
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

export default UserAdd
