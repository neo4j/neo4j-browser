/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as firebase from 'firebase'
export const UP = 'UP'
export const CHECKING = 'CHECKING'
export const DOWN = 'DOWN'
import { getBrowserName } from 'services/utils'

export class SyncManager {
  constructor ({dbConfig, serviceReadyCallback, onSyncCallback}) {
    initialize(dbConfig)
    this.isServiceUp(serviceReadyCallback)
    this.onSync = onSyncCallback
  }
  isServiceUp (serviceReadyCallback) {
    status().on('value', (v) => {
      if (v.val()) {
        if (this._downTimer) {
          clearTimeout(this._downTimer)
          delete this._downTimer
        }
        serviceReadyCallback(UP)
      } else {
        // During connecting, the status is always down for a short time. So wait before setting state to be sure its really down
        this._downTimer = setTimeout(
          () => serviceReadyCallback(DOWN),
        1000
        )
      }
    })
  }
  authCallBack (data, error) {
    if (error) {
      this.serviceAuthenticated = false
      this.error
    } else {
      this.authData = data
      authenticate(this.authData.data_token).then((a) => {
        this.serviceAuthenticated = true
        this.error = null
        this.bindToResource()
      })
        .catch((e) => {
          this.serviceAuthenticated = false
          this.error = e
        })
    }
  }
  bindToResource () {
    this.syncRef = getResourceFor(this.authData.profile.user_id)
    this.syncRef.on('value', (v) => {
      console.log('GOT VAL', v.val())
      if (v.val() == null) {
        setupUser(this.authData.profile.user_id, {
          documents: [{
            'client': getBrowserName(),
            'syncedAt': Date.now()
          }]
        })
      } else {
        this.setSynCData(v.val())
      }
    })
  }
  setSynCData (value) {
    this.onSync({key: this.authData.profile.user_id, syncObj: value, lastSyncedAt: new Date(), authData: this.authData})
  }
}

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
