import { Component } from 'preact'
import { withBus } from 'react-suber'

import bolt from 'services/bolt/bolt'
import { listRolesQuery, createDatabaseUser, addRoleToUser } from 'shared/modules/cypher/boltUserHelper'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'

import RolesSelector from './RolesSelector'
import FrameTemplate from '../Stream/FrameTemplate'
import FrameError from '../Stream/FrameError'
import FrameSuccess from '../Stream/FrameSuccess'

import { CloseIcon } from 'browser-components/icons/Icons'
import { FormButton } from 'browser-components/buttons'

export class UserAdd extends Component {
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
    return this.state.roles.map((role, i) => {
      return (
        <FormButton key={i} label={role} icon={<CloseIcon />} onClick={() => {
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
    const listOfAvailableRoles = (this.state.availableRoles)
      ? (<RolesSelector roles={this.availableRoles()} onChange={(event) => {
        this.setState({roles: this.state.roles.concat([event.target.value])})
      }} />)
      : '-'
    const tableHeaders = ['Username', 'Roles(s)', 'Set Password', 'Confirm Password', 'Force Password Change'].map((heading, i) => {
      return (<th key={i}>{heading}</th>)
    })
    const errors = (this.state.errors) ? this.state.errors.join(', ') : null
    const frameContents = (
      <table>
        <thead>
          <tr>
            {tableHeaders}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input className='username' onChange={this.updateUsername.bind(this)} />
            </td>
            <td>
              {listOfAvailableRoles}
              {this.listRoles()}
            </td>
            <td>
              <input onChange={this.updatePassword.bind(this)} type='password' />
            </td>
            <td>
              <input onChange={this.confirmUpdatePassword.bind(this)} type='password' />
            </td>
            <td>
              <input onClick={this.updateForcePasswordChange.bind(this)} type='checkbox' />
            </td>
          </tr>
          <tr>
            <td>
              <FormButton onClick={this.submit.bind(this)} label='Add User' />
            </td>
          </tr>
        </tbody>
      </table>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={frameContents}
      >
        <FrameError message={errors} />
        <FrameSuccess message={this.state.success} />
      </FrameTemplate>

    )
  }
}

export default withBus(UserAdd)
