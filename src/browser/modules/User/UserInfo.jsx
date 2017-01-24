import React from 'react'
import { connect } from 'react-redux'
import { getCurrentUser, updateCurrentUser } from '../../../shared/modules/currentUser/currentUserDuck'
import bolt from 'services/bolt/bolt'

export class UserInfoComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {user: this.props.info}
  }
  extractUserNameAndRolesFromBolt (r) {
    return {
      username: r.records[0]._fields[0],
      roles: r.records[0]._fields[1]
    }
  }
  componentWillReceiveProps (newProps) {
    this.setState({user: newProps.info})
  }
  componentWillMount () {
    bolt.transaction('CALL dbms.showCurrentUser')
      .then((r) => {
        const user = this.extractUserNameAndRolesFromBolt(r)
        this.props.updateCurrentUser(user.username, user.roles)
      }).catch(() => {})
  }
  render () {
    const currentUser = this.state.user
    const result = (currentUser == null) ? null : JSON.stringify(currentUser)
    return (
      <div id='db-user'>
        <h4>User Information</h4>
        <p>Current user: {result}</p>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    info: getCurrentUser(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateCurrentUser: (username, roles) => {
      dispatch(updateCurrentUser(username, roles))
    }
  }
}

const UserInfo = connect(mapStateToProps, mapDispatchToProps)(UserInfoComponent)
export default UserInfo
