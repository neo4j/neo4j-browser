import React from 'react'
import { connect } from 'react-redux'
import uuid from 'uuid'
import bolt from '../../../../services/bolt/bolt'

export class ListUsersComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {user: {listUsers: null}}
  }
  extractUserNameAndRolesFromBolt (result) {
    return bolt.recordsToTableArray(result.records)
  }
  makeTable (rawData) {
    let copyOfData = rawData
    const headings = copyOfData.slice()[0]
    copyOfData.shift()
    const everythingElse = copyOfData
    const items = everythingElse.map((row) => {
      return (
        <tr key={uuid.v4()} className='user-info'>
          <td className='username'>{row[0]}</td>
          <td className='roles'>{row[1]}</td>
          <button>Remove</button>
        </tr>
      )
    })
    return (
      <table>
        <thead><tr><th>{headings[0]}</th><th>{headings[1]}</th></tr></thead>
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
