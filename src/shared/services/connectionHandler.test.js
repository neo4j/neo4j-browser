/* global describe, beforeEach, afterEach, test, expect */
import * as connectionHandler from './connectionHandler'

const createResolvePromise = (props) => {
  const p = new Promise((resolve, reject) => {
    resolve(props)
  })
  return p
}

const createRejectPromise = (props) => {
  const p = new Promise((resolve, reject) => {
    reject('Error')
  })
  return p
}

const createCredentialObject = (name) => {
  return {name, username: 'neo4j', password: 'pw', host: 'localhost:7687'}
}

describe('connectionHandler', () => {
  describe('open', () => {
    beforeEach(() => {
      connectionHandler.clearAll()
    })

    test.skip('should open a connection and keep it if all resolves', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)
      let expectedVal = createCredentialObject(name)
      delete expectedVal.name

      // When
      const p = connectionHandler.open(props, null, createResolvePromise, createResolvePromise)

      // Then
      // Hack to wait until resolved and then compare with obj from connectionHandler.get(name)
      return Promise.all([expect(p).to.eventually.deep.equal(expectedVal)]).then((c) => {
        expect(c[0]).toEqual(connectionHandler.get(name).connection)
      })
    })

    test.skip('should not keep a connection if connectFn fail', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)

      // When
      const p = connectionHandler.open(props, null, createRejectPromise, createResolvePromise)

      // Then
      return Promise.all([expect(p).to.be.rejected]).then((_) => {
        expect(connectionHandler.get(name)).toBeFalsy()
      })
    })

    test.skip('should not keep a connection if validateFn fail', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)

      // When
      const p = connectionHandler.open(props, null, createResolvePromise, createRejectPromise)

      // Then
      return Promise.all([expect(p).to.be.rejected]).then((_) => {
        expect(connectionHandler.get(name)).toBeFalsy()
      })
    })
  })

  describe('close', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, null, undefined, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, null, undefined, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    test('should remove closed connection from list, and call the callback', () => {
      // Given
      const name = 'first'
      const cb = (conn) => expect(conn.username).toEqual('neo4j')

      // When
      connectionHandler.close(name, cb)

      // Then
      expect(connectionHandler.get(name)).toBeFalsy()
    })
  })

  describe('get', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, null, undefined, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, null, undefined, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    test('should return the expected connection object', () => {
      // Given
      const first = 'first'
      const second = 'second'

      // When & Then
      expect(connectionHandler.get(first).name).toEqual(first)
      expect(connectionHandler.get(second).name).toEqual(second)
    })
  })

  describe('setDefault', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, null, undefined, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, null, undefined, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    test('should change default setting', () => {
      // Given
      const first = 'first'
      const second = 'second'

      // When
      const firstBefore = connectionHandler.get(first).isDefault
      const secondBefore = connectionHandler.get(second).isDefault
      connectionHandler.setDefault(second)

      // Then
      expect(firstBefore).toBeTruthy()
      expect(secondBefore).toBeFalsy()
      expect(connectionHandler.get(first).isDefault).toBeFalsy()
      expect(connectionHandler.get(second).isDefault).toBeTruthy()
    })
  })

  describe('clearAll', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, null, undefined, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, null, undefined, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    test('should clear all connections', () => {
      // Given
      const first = 'first'
      const second = 'second'
      const firstBefore = connectionHandler.get(first)
      const secondBefore = connectionHandler.get(second)

      // When
      connectionHandler.clearAll()

      // Then
      expect(firstBefore.name).toEqual(first)
      expect(secondBefore.name).toEqual(second)
      expect(connectionHandler.get(first)).toBeFalsy()
      expect(connectionHandler.get(second)).toBeFalsy()
    })
  })
})
