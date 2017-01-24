import chai from 'chai'
import * as connectionHandler from './connectionHandler'
import chaiAsPromised from 'chai-as-promised'

const expect = chai.expect
chai.use(chaiAsPromised)

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

    it('should open a connection and keep it if all resolves', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)
      let expectedVal = createCredentialObject(name)
      delete expectedVal.name

      // When
      const p = connectionHandler.open(props, createResolvePromise, createResolvePromise)

      // Then
      // Hack to wait until resolved and then compare with obj from connectionHandler.get(name)
      return Promise.all([expect(p).to.eventually.deep.equal(expectedVal)]).then((c) => {
        expect(c[0]).to.deep.equal(connectionHandler.get(name).connection)
      })
    })

    it('should not keep a connection if connectFn fail', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)

      // When
      const p = connectionHandler.open(props, createRejectPromise, createResolvePromise)

      // Then
      return Promise.all([expect(p).to.be.rejected]).then((_) => {
        expect(connectionHandler.get(name)).to.be.false
      })
    })

    it('should not keep a connection if validateFn fail', () => {
      // Given
      const name = 'first'
      const props = createCredentialObject(name)

      // When
      const p = connectionHandler.open(props, createResolvePromise, createRejectPromise)

      // Then
      return Promise.all([expect(p).to.be.rejected]).then((_) => {
        expect(connectionHandler.get(name)).to.be.false
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
        return connectionHandler.open(props, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    it('should remove closed connection from list, and call the callback', () => {
      // Given
      const name = 'first'
      const cb = (conn) => expect(conn.username).to.equal('neo4j')

      // When
      connectionHandler.close(name, cb)

      // Then
      expect(connectionHandler.get(name)).to.be.false
    })

    it('should set an existing connection to default when current default is closed', () => {
      // Given
      const first = 'first'
      const second = 'second'

      // When
      const firstIsDefault = connectionHandler.get(first).isDefault
      connectionHandler.close(first)
      const secondIsDefault = connectionHandler.get(second).isDefault

      // Then
      expect(firstIsDefault).to.be.true
      expect(secondIsDefault).to.be.true
      expect(connectionHandler.get(first)).to.be.false
    })
  })

  describe('get', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    it('should return the expected connection object', () => {
      // Given
      const first = 'first'
      const second = 'second'

      // When & Then
      expect(connectionHandler.get(first).name).to.equal(first)
      expect(connectionHandler.get(second).name).to.equal(second)
    })
  })

  describe('setDefault', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    it('should change default setting', () => {
      // Given
      const first = 'first'
      const second = 'second'

      // When
      const firstBefore = connectionHandler.get(first).isDefault
      const secondBefore = connectionHandler.get(second).isDefault
      connectionHandler.setDefault(second)

      // Then
      expect(firstBefore).to.be.true
      expect(secondBefore).to.be.false
      expect(connectionHandler.get(first).isDefault).to.be.false
      expect(connectionHandler.get(second).isDefault).to.be.true
    })
  })

  describe('clearAll', () => {
    beforeEach(() => {
      const name = 'first'
      const props = createCredentialObject(name)
      const name2 = 'second'
      const props2 = createCredentialObject(name2)
      return Promise.resolve().then(() => {
        return connectionHandler.open(props, createResolvePromise, createResolvePromise)
      }).then(() => {
        return connectionHandler.open(props2, createResolvePromise, createResolvePromise)
      })
    })

    afterEach(() => {
      connectionHandler.clearAll()
    })

    it('should clear all connections', () => {
      // Given
      const first = 'first'
      const second = 'second'
      const firstBefore = connectionHandler.get(first)
      const secondBefore = connectionHandler.get(second)

      // When
      connectionHandler.clearAll()

      // Then
      expect(firstBefore.name).to.equal(first)
      expect(secondBefore.name).to.equal(second)
      expect(connectionHandler.get(first)).to.be.false
      expect(connectionHandler.get(second)).to.be.false
    })
  })
})
