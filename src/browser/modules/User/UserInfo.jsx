import { Component } from 'preact'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { getCurrentUser, updateCurrentUser } from 'shared/modules/currentUser/currentUserDuck'

export class UserInfoComponent extends Component {
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
    this.props.bus.self(
      CYPHER_REQUEST,
      'CALL dbms.showCurrentUser',
      (response) => {
        if (!response.success) return
        const user = this.extractUserNameAndRolesFromBolt(response)
        this.props.updateCurrentUser(user.username, user.roles)
      }
    )
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

const UserInfo = withBus(connect(mapStateToProps, mapDispatchToProps)(UserInfoComponent))
export default UserInfo
