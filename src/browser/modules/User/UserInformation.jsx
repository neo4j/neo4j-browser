import React from 'react'
import {v4} from 'uuid'

import { deleteUser, addRoleToUser, removeRoleFromUser } from './boltUserHelper'

import TableRow from 'grommet/components/TableRow'
import Button from 'grommet/components/Button'
import CloseIcon from 'grommet/components/icons/base/Close'
import RolesSelector from './RolesSelector'

export class UserInformation extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      edit: false,
      availableRoles: this.props.availableRoles,
      roles: this.props.roles || [],
      username: this.props.username,
      forcePasswordChange: false
    }
    this.removeClick = this.props.onRemoveClick || function (username) {
      deleteUser(username, (r) => { return this.props.callback() })
    }
  }
  statusButton (statusList) {
    if (statusList.indexOf('is_suspended') !== -1) {
      return (<div>Activated<Button label='Suspend user' onClick={() => {}} /></div>)
    } else {
      return (<div>Suspended<Button label='Active user' onClick={() => {}} /></div>)
    }
  }
  passwordChange () {
    return '-'
  }
  listRoles () {
    return this.state.roles.map((role) => {
      return (
        <Button key={v4()} label={role} icon={<CloseIcon />} onClick={() => {
          removeRoleFromUser(role, this.state.username, () => this.props.callback())
        }} />
      )
    })
  }
  render () {
    return (
      <TableRow className='user-info'>
        <td className='username'>{this.props.username}</td>
        <td className='roles'>
          <span>
            {this.listRoles()}
          </span>
          <RolesSelector roles={this.props.listOfAvailableRoles} onChange={({option}) => {
            addRoleToUser(this.state.username, option, (r) => { this.props.callback() })
          }} />
        </td>
        <td className='status'>
          {this.statusButton(this.props.status)}
        </td>
        <td className='password-change'>
          {this.passwordChange()}
        </td>
        <td className='delete'>
          <Button label='Remove' onClick={() => {
            this.removeClick(this.props.username)
          }} />
        </td>
      </TableRow>
    )
  }
}

export default UserInformation
