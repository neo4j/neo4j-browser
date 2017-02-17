import React from 'react'
import uuid from 'uuid'
import { listUsersQuery, listRolesQuery } from 'shared/modules/cypher/boltUserHelper'
import UserInformation from './UserInformation'
import bolt from 'services/bolt/bolt'

import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { withBus } from 'react-suber'

import Table from 'grommet/components/Table'
import TableHeader from 'grommet/components/TableHeader'

import FrameTemplate from '../Stream/FrameTemplate'

export class UserList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      userList: this.props.users || [],
      listRoles: this.props.roles || []
    }
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  getUserList () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listUsersQuery()},
      (response) => {
        if (response.success) this.setState({userList: this.extractUserNameAndRolesFromBolt(response.result)})
      })
  }
  getRoles () {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: listRolesQuery()},
      (response) => {
        const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])
        if (response.success) this.setState({listRoles: flatten(this.extractUserNameAndRolesFromBolt(response.result))})
      })
  }
  makeTable (data) {
    const items = data.map((row) => {
      return (
        <UserInformation className='user-information' key={uuid.v4()} username={row[0]} roles={row[1]} status={row[2]} callback={this.getUserList.bind(this)} availableRoles={this.state.listRoles} />
      )
    })
    return (
      <Table>
        <TableHeader labels={['Username', 'Roles(s)', 'Status', 'Password Change', 'Delete']} />
        <tbody>{items}</tbody>
      </Table>
    )
  }
  componentWillMount () {
    this.getUserList()
    this.getRoles()
  }
  render () {
    const renderedListOfUsers = (this.state.userList) ? this.makeTable(this.state.userList) : 'No users'
    const frameContents = (
      <div className='db-list-users'>
        {renderedListOfUsers}
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

export default withBus(UserList)
