import React from 'react'
import uuid from 'uuid'
import { connect } from 'react-redux'
import { UserDetailsComponent } from './UserDetails'
import bolt from '../../../../services/bolt/bolt'

export class ListUsersComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {user: {listUsers: this.props.users}}
  }
  extractUserNameAndRolesFromBolt (result) {
    let tableArray = bolt.recordsToTableArray(result.records)
    tableArray.shift()
    return tableArray
  }
  makeTable (data) {
    const items = data.map((row) => {
      return (
        <UserDetailsComponent key={uuid.v4()} username={row[0]} roles={row[1]} />
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
    Promise.resolve(bolt.transaction('CALL dbms.listUsers'))
      .then((r) => {
        const result = this.extractUserNameAndRolesFromBolt(r)
        return this.setState({user: {listUsers: result}})
      })
  }
  render () {
    const listUsers = this.state.user.listUsers
    const result = (listUsers == null) ? null : this.makeTable(listUsers)
    return (
      <div className='db-list-users'>
        <h4>Users in Neo4j</h4>
        <p>List of users:</p>
        {result}
        <button>Add User</button>
      </div>
    )
  }
}

const ListUsers = connect(null, null)(ListUsersComponent)
export default ListUsers
