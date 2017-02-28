import React from 'react'
import {v4} from 'uuid'
import { withBus } from 'react-suber'

import bolt from 'services/bolt/bolt'
import { listRolesQuery, createDatabaseUser, addRoleToUser } from 'shared/modules/cypher/boltUserHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

import RolesSelector from './RolesSelector'
import FrameTemplate from '../Stream/FrameTemplate'

import { FormButton } from 'nbnmui/buttons'
import TextInput from 'grommet/components/TextInput'
import CheckBox from 'grommet/components/CheckBox'
import Notification from 'grommet/components/Notification'
import CloseIcon from 'grommet/components/icons/base/Close'

export class UserAdd extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: '',
      password: '',
      confirmPassword: '',
      forcePasswordChange: false,
      errors: null,
      success: null
    }
  }
  componentWillMount () {
    this.getRoles()
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  removeRole (role) {
    const roles = this.state.roles.slice()
    roles.splice(this.state.roles.indexOf(role), 1)
    return roles
  }
  listRoles () {
    return this.state.roles.map((role) => {
      return (
        <FormButton key={v4()} label={role} icon={<CloseIcon />} onClick={() => {
          this.setState({roles: this.removeRole(role)})
        }} />
      )
    })
  }
  addRoles () {
    let errors = []
    this.state.roles.forEach((role) => {
      this.props.bus.self(
        CYPHER_REQUEST,
        {query: addRoleToUser(this.state.username, role)},
        (response) => {
          if (!response.success) {
            return errors.add(response.error)
          }
        }
      )
    })
    if (errors.length > 0) {
      return this.setState({errors: errors})
    }
    return this.setState({success: `${this.state.username} created`})
  }
  getRoles () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listRolesQuery()},
      (response) => {
        if (!response.success) {
          return this.setState({errors: ['Unable to create user', response.error]})
        }
        const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
        return this.setState({availableRoles: flatten(this.extractUserNameAndRolesFromBolt(response.result))})
      })
  }
  submit () {
    this.setState({success: null, errors: null})
    let errors = []
    if (!this.state.username) errors.push('Missing username')
    if (!this.state.password) errors.push('Missing password')
    if (!(this.state.password === this.state.confirmPassword)) errors.push('Passwords are not the same')
    if (errors.length !== 0) {
      return this.setState({errors: errors})
    } else {
      this.setState({errors: null})
      return this.createUser()
    }
  }
  createUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: createDatabaseUser(this.state)},
      (response) => {
        if (!response.success) {
          return this.setState({errors: ['Unable to create user', response.error]})
        }
        return this.addRoles.bind(this)
      })
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
    const tableHeaders = ['Username', 'Roles(s)', 'Set Password', 'Confirm Password', 'Force Password Change'].map((heading, i) => {
      return (<th key={i}>{heading}</th>)
    })
    const frameContents = (
      <div>
        <table>
          <thead>
            <tr>
              {tableHeaders}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <TextInput className='username' onDOMChange={this.updateUsername.bind(this)} />
              </td>
              <td>
                {listOfAvailableRoles}
                {this.listRoles()}
              </td>
              <td>
                <TextInput onDOMChange={this.updatePassword.bind(this)} type='password' />
              </td>
              <td>
                <TextInput onDOMChange={this.confirmUpdatePassword.bind(this)} type='password' />
              </td>
              <td>
                <CheckBox onClick={this.updateForcePasswordChange.bind(this)} />
              </td>
            </tr>
            <tr>
              <td>
                <FormButton onClick={this.submit.bind(this)} label='Add User' />
              </td>
            </tr>
          </tbody>
        </table>
        {this.state.errors == null ? null : <Notification status='warning' state={this.state.errors.join(', ')} message='Form not complete' />}
        {this.state.success ? <Notification status='ok' message={this.state.success} /> : null}
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

export default withBus(UserAdd)
