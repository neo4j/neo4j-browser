/* global describe, test, expect */
import * as ls from './localstorage'

describe('localstorage', () => {
  test('getItem return items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      getItem: (key) => {
        expect(key).toEqual(ls.keyPrefix + givenKey)
        return JSON.stringify(givenVal)
      }
    }
    ls.setStorage(storage)

    // When
    const response = ls.getItem(givenKey)

    // Then
    expect(response).toEqual(givenVal)
  })

  test('setItem sets items', () => {
    // Given
    const givenKey = 'myKey'
    const givenVal = 'myVal'
    const storage = {
      setItem: (key, val) => {
        expect(key).toEqual(ls.keyPrefix + givenKey)
        expect(val).toEqual(JSON.stringify(givenVal))
      }
    }
    ls.setStorage(storage)

    // When
    const response = ls.setItem(givenKey, givenVal)

    // Then
    expect(response).toBeTruthy()
  })

  test('should fetch items from storage based on key input', () => {
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
    ls.applyKeys(...keys)
    ls.setStorage(storage)

    // When
    const response = ls.getAll()

    // Then
    expect(response).toEqual(vals)
  })
})
