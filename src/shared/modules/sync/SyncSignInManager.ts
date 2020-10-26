/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import {
  authenticate,
  initialize,
  status,
  getResourceFor,
  setupUser,
  signOut
} from 'services/browserSyncService'
import { getBrowserName } from 'services/utils'
import { UP, DOWN } from 'shared/modules/sync/syncDuck'

class SyncSignInManager {
  constructor({
    dbConfig,
    serviceReadyCallback,
    onSyncCallback,
    disconnectCallback = null
  }) {
    initialize(dbConfig)
    this.isServiceUp(serviceReadyCallback)
    this.onSync = onSyncCallback
    this.onDisconnect = disconnectCallback
  }

  isServiceUp(serviceReadyCallback) {
    status().on('value', v => {
      if (v.val()) {
        if (this._downTimer) {
          clearTimeout(this._downTimer)
          delete this._downTimer
        }
        serviceReadyCallback(UP)
      } else {
        // During connecting, the status is always down for a short time. So wait before setting state to be sure its really down
        this._downTimer = setTimeout(() => serviceReadyCallback(DOWN), 10000)
      }
    })
  }

  authCallBack(data, error, successFn = null, errorFn = null) {
    if (error) {
      this.serviceAuthenticated = false
      this.error = error
      errorFn && errorFn(error)
    } else {
      this.authenticateWithDataAndBind(data, successFn, errorFn)
    }
  }

  authenticateWithDataAndBind(authData, successFn = null, errorFn = null) {
    this.authData = authData
    authenticate(this.authData.data_token, this.onDisconnect)
      .then(a => {
        this.serviceAuthenticated = true
        this.error = null
        this.bindToResource()
        successFn && successFn(authData)
      })
      .catch(e => {
        this.serviceAuthenticated = false
        this.error = e
        errorFn && errorFn(e)
      })
  }

  bindToResource() {
    this.syncRef = getResourceFor(this.authData.profile.user_id)
    this.syncRef.on('value', v => {
      if (v.val() === null) {
        setupUser(this.authData.profile.user_id, {
          documents: [
            {
              client: getBrowserName(),
              syncedAt: Date.now()
            }
          ]
        })
      } else {
        this.setSyncData(v.val())
      }
    })
  }

  signOut() {
    signOut()
  }

  setSyncData(value) {
    this.onSync({
      key: this.authData.profile.user_id,
      syncObj: value,
      lastSyncedAt: new Date()
    })
  }
}

export default SyncSignInManager
