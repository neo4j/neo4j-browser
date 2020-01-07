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

import { v4 as uuid } from 'uuid'
import WorkPool from './WorkPool'

describe('Workpool', () => {
  let createWorker
  let register
  let id
  let postMessage
  beforeEach(() => {
    postMessage = jest.fn()
    createWorker = jest.fn(() => {
      return {
        postMessage
      }
    })
    register = new WorkPool(createWorker)
    id = uuid()
  })
  test('can do and finish work', () => {
    // Given
    const work = {
      id
    }
    // When
    const workObj = register.doWork(work)

    // Then
    expect(register.getQueueSize()).toEqual(0)
    expect(register.getPoolSize()).toEqual(1)
    expect(register.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(1)
    expect(register.getPoolSize(WorkPool.workerStates.FREE)).toEqual(0)
    expect(createWorker).toHaveBeenCalledTimes(1)
    expect(workObj.id).toEqual(id)

    // When
    workObj.finish()

    // Then
    expect(register.getQueueSize()).toEqual(0)
    expect(register.getPoolSize()).toEqual(1)
    expect(register.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(0)
    expect(register.getPoolSize(WorkPool.workerStates.FREE)).toEqual(1)
    expect(createWorker).toHaveBeenCalledTimes(1)
  })
  test('can have onFinish ques', () => {
    // Given
    const id1 = { id: uuid() }
    const id2 = { id: uuid() }
    const id3 = { id: uuid() }
    const onFinishFn1 = jest.fn()
    const onFinishFn2 = jest.fn()
    const onFinishFn3 = jest.fn()

    // When
    const workObj1 = register.doWork(id1)
    const workObj2 = register.doWork(id2)
    workObj1.onFinish(onFinishFn1)
    workObj2.onFinish(onFinishFn2)

    // Then
    expect(createWorker).toHaveBeenCalledTimes(2)
    expect(onFinishFn1).toHaveBeenCalledTimes(0)
    expect(onFinishFn2).toHaveBeenCalledTimes(0)

    // When
    workObj1.finish()

    // Then
    expect(createWorker).toHaveBeenCalledTimes(2)
    expect(onFinishFn1).toHaveBeenCalledTimes(1)
    expect(onFinishFn2).toHaveBeenCalledTimes(0)

    // When
    const workObj3 = register.doWork(id3)
    workObj3.onFinish(onFinishFn3)
    workObj2.finish()

    // Then
    expect(onFinishFn1).toHaveBeenCalledTimes(1)
    expect(onFinishFn2).toHaveBeenCalledTimes(1)
    expect(onFinishFn3).toHaveBeenCalledTimes(0)

    // When
    workObj3.finish()

    // Then
    expect(onFinishFn1).toHaveBeenCalledTimes(1)
    expect(onFinishFn2).toHaveBeenCalledTimes(1)
    expect(onFinishFn3).toHaveBeenCalledTimes(1)
  })

  test('creates new workers if all are busy (not reaching pool size limit)', () => {
    // Given
    const id1 = { id: uuid() }
    const id2 = { id: uuid() }

    // When
    const workObj1 = register.doWork(id1)
    const workObj2 = register.doWork(id2)

    // Then
    expect(register.getPoolSize()).toEqual(2)
    expect(createWorker).toHaveBeenCalledTimes(2)
    expect(workObj1.id).toEqual(id1.id)
    expect(workObj2.id).toEqual(id2.id)
    expect(register.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(2)
    expect(register.getPoolSize(WorkPool.workerStates.FREE)).toEqual(0)
  })
  test('re-uses workers if there are available ones', () => {
    // Given
    const id1 = { id: uuid() }
    const id2 = { id: uuid() }
    const id3 = { id: uuid() }
    const id4 = { id: uuid() }

    // When
    const workObj1 = register.doWork(id1)
    const workObj2 = register.doWork(id2)
    register.doWork(id3)
    workObj1.finish()
    workObj2.finish()

    // When
    register.doWork(id4)

    // Then
    expect(createWorker).toHaveBeenCalledTimes(3)
    expect(register.getPoolSize()).toEqual(3)
    expect(register.getPoolSize(WorkPool.workerStates.FREE)).toEqual(1)
    expect(register.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(2)
  })
  it('exposes getWorkById and finds queued and ongoing work', () => {
    // Given
    const localRegister = new WorkPool(createWorker, 1)
    const initialWorkId = 'initial'

    // When
    // Just do some work so queue pool limit is reached
    const initialWorkObj = localRegister.doWork({ id: initialWorkId })

    const work = { id }
    const workObj = localRegister.doWork(work)

    // Then
    expect(createWorker).toHaveBeenCalledTimes(1)
    expect(workObj.id).toEqual(id)

    // When
    const workObj1 = localRegister.getWorkById(initialWorkId)
    const workObj2 = localRegister.getWorkById(id)

    // Then
    expect(workObj).toBe(workObj2) // same obj in memory
    expect(workObj1).toBe(initialWorkObj) // same obj in memory

    // When
    // Try something that's not there
    const notWorkObj = localRegister.getWorkById('not-present-id')

    // Then
    expect(notWorkObj).toEqual(null)
  })
  it('respcts the maxPoolSize and put jobs in queue', () => {
    // Given
    const poolSize = 2
    const localRegister = new WorkPool(createWorker, poolSize)
    const id1 = { id: uuid() }
    const id2 = { id: uuid() }
    const id3 = { id: uuid() }
    const id4 = { id: uuid() }

    // When
    const workObj1 = localRegister.doWork(id1)
    const workObj2 = localRegister.doWork(id2)
    const workObj3 = localRegister.doWork(id3)

    // Then
    expect(localRegister.getPoolSize()).toEqual(poolSize)
    expect(localRegister.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(
      poolSize
    )
    expect(localRegister.getPoolSize(WorkPool.workerStates.FREE)).toEqual(0)
    expect(localRegister.getQueueSize()).toEqual(1)

    // When
    workObj1.finish()

    // Then
    expect(localRegister.getPoolSize()).toEqual(poolSize)
    expect(localRegister.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(
      poolSize
    )
    expect(localRegister.getPoolSize(WorkPool.workerStates.FREE)).toEqual(0)
    expect(localRegister.getQueueSize()).toEqual(0)

    // When
    const workObj4 = localRegister.doWork(id4)

    // Then
    expect(localRegister.getPoolSize()).toEqual(poolSize)
    expect(localRegister.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(
      poolSize
    )
    expect(localRegister.getPoolSize(WorkPool.workerStates.FREE)).toEqual(0)
    expect(localRegister.getQueueSize()).toEqual(1)

    // When
    workObj2.finish()
    workObj3.finish()
    workObj4.finish()

    // Then
    expect(createWorker).toHaveBeenCalledTimes(poolSize)
    expect(localRegister.getPoolSize()).toEqual(poolSize)
    expect(localRegister.getPoolSize(WorkPool.workerStates.FREE)).toEqual(
      poolSize
    )
    expect(localRegister.getPoolSize(WorkPool.workerStates.BUSY)).toEqual(0)
  })
  test('Can message all workers at once', () => {
    const message = { type: 'hello all' }
    const postMessage1 = jest.fn()
    const postMessage2 = jest.fn()
    const postMessage3 = jest.fn()
    const createWorker = jest
      .fn()
      .mockImplementationOnce(() => {
        return {
          postMessage: postMessage1
        }
      })
      .mockImplementationOnce(() => {
        return {
          postMessage: postMessage2
        }
      })
      .mockImplementationOnce(() => {
        return {
          postMessage: postMessage3
        }
      })
    const localRegister = new WorkPool(createWorker)
    const id1 = { id: uuid() } // No work, just to create workers
    const id2 = { id: uuid() } // No work, just to create workers
    const id3 = { id: uuid() } // No work, just to create workers

    // When
    localRegister.doWork(id1)
    localRegister.doWork(id2)
    localRegister.doWork(id3)
    localRegister.messageAllWorkers(message)

    // Then
    expect(postMessage1).toHaveBeenCalledTimes(1)
    expect(postMessage1).toHaveBeenCalledWith(message)
    expect(postMessage2).toHaveBeenCalledTimes(1)
    expect(postMessage2).toHaveBeenCalledWith(message)
    expect(postMessage3).toHaveBeenCalledTimes(1)
    expect(postMessage3).toHaveBeenCalledWith(message)
  })
})
