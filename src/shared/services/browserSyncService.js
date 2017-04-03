import * as firebase from 'firebase'

export const authenticate = (dataToken) => {
  return firebase.auth().signInWithCustomToken(dataToken)
}

export const initialize = (config) => {
  if (firebase.apps.length && firebase.apps.length > 0) {
    return
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

export const setupUser = (userId, initialData) => {
  firebase.database().ref('users/' + userId).set(initialData)
}

export const signOut = () => {
  firebase.auth().signOut()
}
