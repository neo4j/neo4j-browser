/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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
import { v4 as uuid } from 'uuid'

class WorkPool {
  static workerStates = {
    BUSY: 'busy',
    FREE: 'free'
  }
  constructor (createWorker, maxPoolSize = 15) {
    this.createWorker = createWorker
    this.maxPoolSize = maxPoolSize
    this.register = []
    this.q = []
  }
  // Public methods
  getPoolSize (state) {
    if (!state) {
      return this.register.length
    }
    return this.register.filter(w => w.state === state).length
  }
  getQueueSize () {
    return this.q.length
  }
  getWorkById (id) {
    for (let i = 0; i < this.q.length; i++) {
      if (this.q[i].id === id) {
        return this.q[i]
      }
    }
    return null
  }
  doWork ({ id, payload, onmessage }) {
    const work = this._buildWorkObj({ id: id || uuid(), payload, onmessage })
    this._addToQ(work)
    this._next()
    return work
  }

  // Implemtation details
  _getFreeWorker (id) {
    const len = this.register.length
    for (let i = len - 1; i >= 0; i--) {
      if (this.register[i].state === WorkPool.workerStates.FREE) {
        return this.register[i]
      }
    }
    const poolSize = this.getPoolSize()
    if (poolSize < this.maxPoolSize) {
      const workerObj = this._buildWorkerObj(
        this.createWorker(),
        WorkPool.workerStates.BUSY
      )
      this.register.push(workerObj)
      return workerObj
    }
    return null
  }
  _next () {
    if (!this.getQueueSize()) {
      return
    }
    const workerObj = this._getFreeWorker()
    if (!workerObj) {
      return
    }
    const work = this.q.shift()
    workerObj.id = work.id
    work._assignWorker(workerObj)
    work._executeInitial()
  }
  _addToQ (work) {
    this.q.push(work)
  }
  _removeFromQ (id) {
    this.q.splice(this.q.findIndex(el => el.id === id), 1)
  }
  _unregisterWorker = id => {
    const worker = this._getWorkerById(id)
    if (worker === null) {
      return
    }
    worker.state = WorkPool.workerStates.FREE
    this._next()
  }
  _buildWorkObj ({ id, payload, onmessage }) {
    const obj = {
      id,
      _worker: undefined,
      _executed: false,
      _finishFn: undefined
    }
    obj.execute = payload => {
      if (payload && obj._workerObj) {
        obj._workerObj.worker.postMessage(payload)
      }
    }
    obj.onFinish = fn => (obj._finishFn = fn)
    obj.finish = () => {
      if (!obj._executed) {
        this._removeFromQ(id)
      }
      obj._workerObj && obj._workerObj.finish(id)
      obj._finishFn && obj._finishFn({ executed: obj._executed, id })
    }
    obj._executeInitial = () => {
      if (onmessage) {
        obj._workerObj.worker.onmessage = onmessage
      }
      if (payload) {
        obj._workerObj.worker.postMessage(payload)
      }
      obj._executed = true
    }
    obj._assignWorker = workerObj => {
      workerObj.state = WorkPool.workerStates.BUSY
      obj._workerObj = workerObj
    }

    return obj
  }
  _buildWorkerObj (worker, state) {
    const obj = {
      worker,
      state
    }
    obj.finish = id => {
      this._unregisterWorker(id)
    }
    return obj
  }
  _getWorkerById (id) {
    for (let i = 0; i < this.register.length; i++) {
      if (this.register[i].id === id) {
        return this.register[i]
      }
    }
    return null
  }
}

export default WorkPool
