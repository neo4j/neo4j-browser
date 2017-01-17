import { Component } from 'preact'
import * as firebase from 'firebase'

export class BrowserSync extends Component {
  constructor (props) {
    super(props)

    this.state = {
      loggedIn: false,
      authData: null,
      speed: 10,
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
  }
  componentWillMount () {
    if (this.firebaseApp) {
      this.firebaseApp.close()
    } else {
      this.initializeFirebaseApp()
    }
  }
  componentDidMount () {
    this.checkFirebaseIsUp()
  }
  logIn () {
    const domain = 'https://auth.neo4j.com/index.html'
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
    const rootRef = firebase.database().ref('users/' + this.authData.profile.user_id).child('user')
    const speedRef = rootRef.child('speed')
    speedRef.on('value', snap => {
      this.setState({
        speed: snap.val()
      })
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
