import { Component } from 'preact'
import { authenticate, initialize, status, getResourceFor } from 'services/browserSyncService'
import BrowserSyncAuthWindow from './BrowserSyncAuthWindow'
export class BrowserSync extends Component {
  constructor (props) {
    super(props)

    this.state = {
      authData: null,
      error: null,
      serviceAuthenticated: false,
      status: 'DOWN'
    }
  }
  authCallBack (data) {
    this.setState({authData: data})
    authenticate(this.state.authData.data_token).then((a) => {
      this.setState({serviceAuthenticated: true})
      this.bindToResource()
    })
    .catch((e) => {
      this.setState({serviceAuthenticated: false, error: e})
    })
  }
  componentWillMount () {
    initialize()
    this.serviceIsUp()
  }
  logIn () {
    BrowserSyncAuthWindow('https://localhost:9001', this.authCallBack.bind(this))
  }
  serviceIsUp () {
    status().on('value', (v) => {
      if (v.val()) {
        this.setState({
          status: 'UP'
        })
      } else {
        this.state = {
          status: 'DOWN'
        }
      }
    })
  }
  logOut () {
    this.setState({authData: null})
  }
  bindToResource () {
    getResourceFor(this.state.authData.profile.user_id).on('value', (v) => {
      console.log('top level object', v.val())
    })
  }

  render () {
    if (this.state.status === 'UP') {
      let button = <button id='browserSyncLogin' onClick={this.logIn.bind(this)}>Login</button>
      let profile = null
      if (this.state.serviceAuthenticated) {
        button = <button id='browserSyncLogout' onClick={this.logOut.bind(this)}>Logout</button>
        profile = (
          <div>
            Signed in
          </div>
        )
      }
      return (
        <div>
          {button}
          {profile}
        </div>
      )
    } else {
      return <div>Sync service is down</div>
    }
  }
}
