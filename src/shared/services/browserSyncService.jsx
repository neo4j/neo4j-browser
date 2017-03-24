import * as firebase from 'firebase'

export const authenticate = (dataToken) => {
  return firebase.auth().signInWithCustomToken(dataToken)
}

export const initialize = () => {
  if (firebase.apps.length && firebase.apps.length > 0) {
    return
  }

  const config = {
    apiKey: 'AIzaSyB-zOxTpnQQjryMWzGbtN9aIHvjzv5mwR8',
    databaseURL: 'https://my-first-app-v2-4dbd3.firebaseio.com',
    messagingSenderId: '2586483860'
  }

  return firebase.initializeApp(config)
}

export const status = () => {
  return firebase.database().ref('.info/connected')
}

export const getResourceFor = (userId) => {
  return firebase.database().ref('users/' + userId)
}

export const syncResourceFor = (userId, key, value) => {
  const userRef = firebase.database().ref('users/' + userId)
  userRef.child(key).set(value)
}

export const signOut = () => {
  firebase.auth().signOut()
}
