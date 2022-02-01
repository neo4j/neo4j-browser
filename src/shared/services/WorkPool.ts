/*
 * Copyright (c) "Neo4j"
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
import { QueryResult } from 'neo4j-driver'
import { v4 as uuid } from 'uuid'

import BoltWorkerModule from 'shared/services/bolt/boltWorker'

export type WorkerMessageHandler = (message: {
  data: {
    type: string
    error: Error
    result: QueryResult
  }
}) => void

class Work {
  private executed = false
  private finishFn?: (payload: any) => void = undefined
  private worker?: Worker = undefined

  constructor(
    public readonly id: string,
    private payload: any,
    private onmessage: WorkerMessageHandler,
    private removeFromQueue: (id: string) => void
  ) {}

  execute = (payload: any) => {
    if (payload && this.worker) {
      this.worker.worker.postMessage(payload)
    }
  }

  onFinish = (fn: (payload: any) => void) => (this.finishFn = fn)

  finish = () => {
    if (!this.executed) {
      this.removeFromQueue(this.id)
    }
    this.worker && this.worker.finish(this.id)
    this.finishFn && this.finishFn({ executed: this.executed, id: this.id })
  }

  executeInitial = () => {
    if (this.onmessage && this.worker) {
      this.worker.worker.onmessage = this.onmessage
    }

    if (this.payload && this.worker) {
      this.worker.worker.postMessage(this.payload)
    }

    this.executed = true
  }

  assignWorker = (worker: Worker) => {
    worker.id = this.id
    worker.state = WorkPool.workerStates.BUSY
    worker.work = this
    this.worker = worker
  }
}

class Worker {
  public work?: Work
  public id?: string

  constructor(
    public readonly worker: BoltWorkerModule,
    public state: any,
    private unregisterWorker: (id: string) => void
  ) {}

  finish = (id: any) => {
    this.unregisterWorker(id)
  }
}

class WorkPool {
  static workerStates = {
    BUSY: 'busy',
    FREE: 'free'
  }

  createWorker: () => BoltWorkerModule
  maxPoolSize: number
  queue: Array<Work> = []
  register: Array<Worker> = []

  constructor(createWorker: () => BoltWorkerModule, maxPoolSize = 15) {
    this.createWorker = createWorker
    this.maxPoolSize = maxPoolSize
  }

  getPoolSize(state?: any) {
    if (!state) {
      return this.register.length
    }
    return this.register.filter(w => w.state === state).length
  }

  getQueueSize() {
    return this.queue.length
  }

  getWorkById(id: string) {
    return (
      this.queue.find(work => work.id === id) ??
      this.register.find(worker => worker.id === id)?.work ??
      null
    )
  }

  doWork({
    id,
    payload,
    onmessage
  }: {
    id: string
    payload: any
    onmessage: WorkerMessageHandler
  }) {
    const work = new Work(
      id || uuid(),
      payload,
      onmessage,
      this.removeFromQueue
    )
    this.addToQueue(work)
    this.next()
    return work
  }

  messageAllWorkers(msg: any) {
    this.register.forEach(worker => worker.worker.postMessage(msg))
  }

  private getFreeWorker() {
    const freeWorker = this.register.find(
      worker => worker.state === WorkPool.workerStates.FREE
    )
    if (freeWorker) {
      return freeWorker
    }

    const poolSize = this.getPoolSize()
    if (poolSize < this.maxPoolSize) {
      const workerObj = new Worker(
        this.createWorker(),
        WorkPool.workerStates.BUSY,
        this.unregisterWorker
      )
      this.register.push(workerObj)
      return workerObj
    }

    return null
  }

  private next() {
    if (!this.getQueueSize()) {
      return
    }
    const workerObj = this.getFreeWorker()
    if (!workerObj) {
      return
    }
    const work = this.queue.shift()
    if (!work) {
      return
    }

    work.assignWorker(workerObj)
    work.executeInitial()
  }

  private addToQueue(work: Work) {
    this.queue.push(work)
  }

  private removeFromQueue(id: string) {
    this.queue.splice(
      this.queue.findIndex(el => el.id === id),
      1
    )
  }

  private unregisterWorker = (id: string) => {
    const worker = this.register.find(worker => worker.id === id)
    if (!worker) {
      return
    }
    worker.state = WorkPool.workerStates.FREE
    this.next()
  }
}

export default WorkPool
