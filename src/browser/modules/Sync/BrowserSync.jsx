import { Component } from 'preact'
import * as firebase from 'firebase'

export class BrowserSync extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loggedIn: false,
      authData: null,
      error: null,
      authenticated: false,
      status: 'DOWN'
    }

    this.firebaseApp = null
    this.authCallBack = this.authCallBack.bind(this)
  }
  authCallBack (data) {
    this.setState({authData: data})
    this.authenticateWithFirebase()
  }
  authenticateWithFirebase () {
    firebase.auth().signInWithCustomToken(this.state.authData.data_token)
    .then((a) => {
      this.setState({authenticated: true})
      this.bindValuesToFirebase()
    })
    .catch((e) => {
      this.setState({authenticated: false, error: e})
    })
  }
  componentWillMount () {
    if (!this.firebaseApp) {
      this.initializeFirebaseApp()
    }
  }
  componentDidMount () {
    this.checkFirebaseIsUp()
    this.initializeFirebaseApp()
  }
  logIn () {
    const domain = 'https://localhost:9001'
    const win = window.open(domain, 'loginWindow', 'location=0,status=0,scrollbars=0, width=1080,height=720')
    try {
      win.moveTo(500, 300)
    } catch (e) {
      console.log('error')
    }
    window.addEventListener('message', (event) => {
      clearInterval(this.pollInterval)
      this.authCallBack(event.data)
      win.close()
    }, false)
    this.pollInterval = setInterval(() => {
      win.postMessage('Polling for results', domain)
    }, 6000)
  }
  initializeFirebaseApp () {
    this.firebaseApp = null
    const config = {
      apiKey: 'AIzaSyB-zOxTpnQQjryMWzGbtN9aIHvjzv5mwR8',
      authDomain: 'my-first-app-v2-4dbd3.firebaseapp.com',
      databaseURL: 'https://my-first-app-v2-4dbd3.firebaseio.com',
      storageBucket: 'my-first-app-v2-4dbd3.appspot.com',
      messagingSenderId: '2586483860'
    }
    this.firebaseApp = firebase.initializeApp(config)
  }
  checkFirebaseIsUp () {
    firebase.database().ref('.info/connected').on('value', (v) => {
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
  getUserValueFromFirebase () {

  }
  logOut () {
    this.setState({authData: null})
  }
  bindValuesToFirebase () {
    const ref = firebase.database().ref('users/' + this.state.authData.profile.user_id)
    ref.on('value', (v) => {
      console.log('top level object', v.val())
    })
  }

  render () {
    if (this.state.status === 'UP') {
      let button = <button id='browserSyncLogin' onClick={() => this.logIn()}>Login</button>
      let profile = null
      if (this.state.authData) {
        button = <button id='browserSyncLogout' onClick={() => this.logOut()}>Logout</button>
        const profileData = this.state.authData.profile
        profile = (
          <div>
            <img src={profileData.picture} />
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
