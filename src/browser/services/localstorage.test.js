import { expect } from 'chai'
import ls from './localstorage'

describe('localstorage', () => {
  it('getItem return items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      getItem: (key) => {
        expect(key).to.equal(ls.keyPrefix + givenKey)
        return JSON.stringify(givenVal)
      }
    }

    // When
    const response = ls.getItem(givenKey, storage)

    // Then
    expect(response).to.equal(givenVal)
  })

  it('setItem sets items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      setItem: (key, val) => {
        expect(key).to.equal(ls.keyPrefix + givenKey)
        expect(val).to.equal(JSON.stringify(givenVal))
      }
    }

    // When
    const response = ls.setItem(givenKey, givenVal, storage)

    // Then
    expect(response).to.be.true
  })

  it('should fetch items from storage based on key input', () => {
    // Given
    const keys = ['key1', 'key2', 'key3']
    const vals = {
      key1: 'hello',
      key2: [1, 2, 3]
    }
    const storage = {
      getItem: (key) => {
        return JSON.stringify(vals[key.substring(ls.keyPrefix.length)])
      }
    }

    // When
    const response = ls.getStorageForKeys(keys, storage)

    // Then
    expect(response).to.deep.equal(vals)
  })

  it('should persist items when they change', () => {
    // Given
    let time = 0
    const keys = ['key1', 'key2', 'key3']
    const stateInTime = [
      {
        key1: 'hello',
        key2: [1, 2, 3]
      }, {
        key1: 'hello',
        key2: [1, 2, 3],
        key3: 'yes'
      }, {
        key1: 'hi',
        key2: [1, 2, 3],
        key3: 'yes'
      }, {
        key1: 'hello',
        key3: 'yes'
      }
    ]
    let storage = {state: {}}
    storage.setItem = (key, val) => {
      const localKey = key.substring(ls.keyPrefix.length)
      if (val === undefined) return delete storage.state[localKey]
      storage.state[localKey] = JSON.parse(val)
    }

    const store = {
      getState: () => {
        return stateInTime[time++]
      }
    }

    // When
    const listener = ls.createPersistingStoreListener(store, keys, storage)
    listener()
    const storageAtTime0 = {...storage.state}
    listener()
    const storageAtTime1 = {...storage.state}
    listener()
    const storageAtTime2 = {...storage.state}
    listener()
    const storageAtTime3 = {...storage.state}

    // Then
    expect(storageAtTime0).to.deep.equal(stateInTime[0])
    expect(storageAtTime1).to.deep.equal(stateInTime[1])
    expect(storageAtTime2).to.deep.equal(stateInTime[2])
    expect(storageAtTime3).to.deep.equal(stateInTime[3])
  })

  it('applyMiddleware should chain middlewares', () => {
    // Given
    const val = 'myVal'
    const split = (_, val) => val.split('').join(' ')
    const lower = (_, val) => val.toLowerCase()
    const ucFirst = (_, val) => val[0].toUpperCase() + val.slice(1)

    // When
    const res = ls.applyMiddleware(split, lower, ucFirst)(null, val)

    // Then
    expect(res).to.equal('M y v a l')
  })

  it('createPersistingStoreListener should use middlewares', () => {
    // Given
    const keys = ['x', 'y']
    const store = {
      getState: () => {
        return {'x': 'myVal', 'y': 'original'}
      }
    }
    const expected = {'x': 'M y v a l', 'y': store.getState().y}
    let storage = {state: {}}
    storage.setItem = (key, val) => {
      const localKey = key.substring(ls.keyPrefix.length)
      storage.state[localKey] = JSON.parse(val)
    }
    const split = (key, val) => {
      if (key !== 'x') return val
      return val.split('').join(' ')
    }
    const lower = (key, val) => {
      if (key !== 'x') return val
      return val.toLowerCase()
    }
    const ucFirst = (key, val) => {
      if (key !== 'x') return val
      return val[0].toUpperCase() + val.slice(1)
    }

    // When
    const mw = ls.applyMiddleware(split, lower, ucFirst)
    const listener = ls.createPersistingStoreListener(store, keys, storage, mw)
    listener()

    // Then
    keys.forEach((k) => {
      expect(storage.state[k]).to.equal(expected[k])
    })
  })
})
