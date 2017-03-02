import React from 'react'
import {v4} from 'uuid'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { withBus } from 'react-suber'
import { deleteUser, addRoleToUser, removeRoleFromUser, activateUser, suspendUser } from 'shared/modules/cypher/boltUserHelper'

import TableRow from 'grommet/components/TableRow'
import { ActionButton } from 'nbnmui/buttons'
import CloseIcon from 'grommet/components/icons/base/Close'
import RolesSelector from './RolesSelector'

export class UserInformation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      availableRoles: this.props.availableRoles || [],
      roles: this.props.roles || [],
      username: this.props.username
    }
  }
  removeClick (thing) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: deleteUser(this.state.username)},
      this.handleResponse.bind(this)
    )
  }
  suspendUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: suspendUser(this.state.username)},
      this.handleResponse.bind(this)
    )
  }
  activateUser () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: activateUser(this.state.username)},
      this.handleResponse.bind(this)
    )
  }
  statusButton (statusList) {
    if (statusList.indexOf('is_suspended') !== -1) {
      return (<ActionButton label='Suspend user' onClick={this.activateUser.bind(this)} />)
    } else {
      return (<ActionButton label='Active user' onClick={this.suspendUser.bind(this)} />)
    }
  }
  passwordChange () {
    return '-'
  }
  listRoles () {
    return this.state.roles.map((role) => {
      return (
        <ActionButton key={v4()} label={role} icon={<CloseIcon />} onClick={() => {
          this.props.bus.self(
            CYPHER_REQUEST,
            {query: removeRoleFromUser(role, this.state.username)},
            this.handleResponse.bind(this)
          )
        }} />
      )
    })
  }
  onRoleSelect ({option}) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: addRoleToUser(this.state.username, option)},
      this.handleResponse.bind(this)
    )
  }
  handleResponse (response) {
    if (!response.success) return this.setState({errors: [response.error]})
    return this.props.refresh()
  }
  availableRoles () {
    return this.state.availableRoles.filter((role) => this.props.roles.indexOf(role) < 0)
  }
  render () {
    return (
      <TableRow className='user-info'>
        <td className='username'>{this.props.username}</td>
        <td className='roles'>
          <RolesSelector roles={this.availableRoles()} onChange={this.onRoleSelect.bind(this)} />
          <span>
            {this.listRoles()}
          </span>
        </td>
        <td className='status'>
          {this.statusButton(this.props.status)}
        </td>
        <td className='password-change'>
          {this.passwordChange()}
        </td>
        <td>
          <ActionButton className='delete' label='Remove' onClick={this.removeClick.bind(this)} />
        </td>
      </TableRow>
    )
  }
}

export default withBus(UserInformation)
