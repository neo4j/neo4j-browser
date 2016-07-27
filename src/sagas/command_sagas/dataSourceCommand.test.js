import { expect } from 'chai'
import { select, call, spawn, cancel, put } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { createMockTask } from 'redux-saga/utils'
import ds from '../../lib/containers/dataSource'
import frames from '../../lib/containers/frames'
import * as saga from './dataSourceCommand'
import { CreateDataSourceValidationError, RemoveDataSourceValidationError } from '../../services/exceptions'

function createDataSource (id, refreshInterval, isActive) {
  return { id, refreshInterval, isActive }
}

describe('dataSourceCommandSagas', () => {
  it('intervalRunComamnd should call runCommand at a interval', () => {
    // Given
    const dataSource = {refreshInterval: 10}
    const intervalSaga = saga.intervalRunComamnd(dataSource)

    // When
    const actualCallRunCommand1 = intervalSaga.next().value
    const expectedCallRunCommand1 = call(saga.runCommand, dataSource)
    const actualDelayAction = intervalSaga.next().value
    const expectedDelayAction = call(delay, dataSource.refreshInterval * 1000)
    const actualCallRunCommand2 = intervalSaga.next().value
    const expectedCallRunCommand2 = call(saga.runCommand, dataSource)

    // Then
    expect(actualCallRunCommand1).to.deep.equal(expectedCallRunCommand1)
    expect(actualDelayAction).to.deep.equal(expectedDelayAction)
    expect(actualCallRunCommand2).to.deep.equal(expectedCallRunCommand2)
  })
  it('startBackgroundDataSources should call ensureDataSourceStatus for data sources in state', () => {
    // Given
    const dataSourcesInState = [1, 2, 3]
    const startBackgroundDataSourcesSaga = saga.startBackgroundDataSources(10)

    // When
    const actualSelectAction = startBackgroundDataSourcesSaga.next().value
    const expectedSelectAction = select(ds.selectors.getDataSources)
    const actualCallAction = startBackgroundDataSourcesSaga.next(dataSourcesInState).value
    const expectedCallAction = call(saga.ensureDataSourceStatus, dataSourcesInState, {})
    const actualDelayAction = startBackgroundDataSourcesSaga.next().value
    const expectedDelayAction = call(delay, 10000)

    // Then
    expect(actualSelectAction).to.deep.equal(expectedSelectAction)
    expect(actualCallAction).to.deep.equal(expectedCallAction)
    expect(actualDelayAction).to.deep.equal(expectedDelayAction)
  })
  it('stopAndRemoveDataSource should cancel a task and remove from refs', () => {
    // Given
    const id = 'x-x-x'
    const task = createMockTask()
    const refs = {[id]: task, other: 'y'}
    const stopSaga = saga.stopAndRemoveDataSource(id, refs)

    // When
    const actualCancelAction = stopSaga.next().value
    const expectedCancelAction = cancel(task)
    const actualRefs = stopSaga.next().value
    const expectedRefs = {other: 'y'}

    // Then
    expect(actualCancelAction).to.deep.equal(expectedCancelAction)
    expect(actualRefs).to.deep.equal(expectedRefs)
  })
  describe('ensureDataSourceStatus saga', () => {
    it('should stop datasources that have are inactive', () => {
      // Given
      const dss = [createDataSource('x-x-x', 1, 0)]
      const refs = {'x-x-x': true}
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualStopAction = ensureDataSourceStatusSaga.next().value
      const expectedStopAction = call(saga.stopAndRemoveDataSource, dss[0].id, refs)

      // Then
      expect(actualStopAction).to.deep.equal(expectedStopAction)
    })
    it('should start datasources that have no refreshInterval', () => {
      // Given
      const dss = [createDataSource('x-x-x', 0, 1)]
      const refs = {}
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualSpawnAction = ensureDataSourceStatusSaga.next().value
      const expectedSpawnAction = spawn(saga.runCommand, dss[0])
      const newRefs = ensureDataSourceStatusSaga.next('myref').value

      // Then
      expect(actualSpawnAction).to.deep.equal(expectedSpawnAction)
      expect(newRefs[dss[0].id]).to.equal('myref')
    })
    it('should stop a started datasources that have no refreshInterval', () => {
      // Given
      const dss = [createDataSource('x-x-x', 0, 1)]
      const refs = {[dss[0].id]: 'myref'} // Indicates started data source
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualStopCall = ensureDataSourceStatusSaga.next().value
      const expectedStopCall = call(saga.stopAndRemoveDataSource, dss[0].id, refs)
      const newRefs = ensureDataSourceStatusSaga.next({}).value

      // Then
      expect(actualStopCall).to.deep.equal(expectedStopCall)
      expect(newRefs[dss[0].id]).to.be.undefined
    })
    it('should start datasources that have refreshInterval', () => {
      // Given
      const dss = [createDataSource('x-x-x', 10, 1)]
      const refs = {}
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualSpawnAction = ensureDataSourceStatusSaga.next().value
      const expectedSpawnAction = spawn(saga.intervalRunComamnd, dss[0])
      const newRefs = ensureDataSourceStatusSaga.next('myref').value

      // Then
      expect(actualSpawnAction).to.deep.equal(expectedSpawnAction)
      expect(newRefs[dss[0].id]).to.equal('myref')
    })
    it('should stop a started datasources that is set to inactive', () => {
      // Given
      const dss = [createDataSource('x-x-x', 10, 0)]
      const refs = {[dss[0].id]: 'myref'} // Indicates started data source
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualStopCall = ensureDataSourceStatusSaga.next().value
      const expectedStopCall = call(saga.stopAndRemoveDataSource, dss[0].id, refs)
      const newRefs = ensureDataSourceStatusSaga.next({}).value

      // Then
      expect(actualStopCall).to.deep.equal(expectedStopCall)
      expect(newRefs[dss[0].id]).to.be.undefined
    })
    it('should stop a started datasources that har been removed from state', () => {
      // Given
      const key = 'x-x-x'
      const dss = [] // Nothing in state
      const refs = {[key]: 'myref'} // Indicates started data source
      const ensureDataSourceStatusSaga = saga.ensureDataSourceStatus(dss, refs)

      // When
      const actualStopCall = ensureDataSourceStatusSaga.next().value
      const expectedStopCall = call(saga.stopAndRemoveDataSource, key, refs)
      const newRefs = ensureDataSourceStatusSaga.next({}).value

      // Then
      expect(actualStopCall).to.deep.equal(expectedStopCall)
      expect(newRefs[key]).to.be.undefined
    })
  })
  describe('handleDataSourceCommand saga', () => {
    it('should put unknown frame for unknown command', () => {
      // Given
      const action = {cmd: ':x unknown', id: 'x-x-x'}
      const cmdchar = ':'
      const handleDataSourceCommandSaga = saga.handleDataSourceCommand(action, cmdchar)

      // When
      const actual = handleDataSourceCommandSaga.next().value
      const expected = put(frames.actions.add({...action, type: 'unknown'}))

      // Then
      expect(actual).to.deep.equal(expected)
    })
    it('should call handleDataSourceCreateCommand for create command', () => {
      // Given
      const action = {cmd: ':x create', id: 'x-x-x'}
      const cmdchar = ':'
      const handleDataSourceCommandSaga = saga.handleDataSourceCommand(action, cmdchar)

      // When
      const actual = handleDataSourceCommandSaga.next().value
      const expected = call(saga.handleDataSourceCreateCommand, action, cmdchar)

      // Then
      expect(actual).to.deep.equal(expected)
    })
    it('should call handleDataSourceRemoveCommand for remove command', () => {
      // Given
      const action = {cmd: ':x remove', id: 'x-x-x'}
      const cmdchar = ':'
      const handleDataSourceCommandSaga = saga.handleDataSourceCommand(action, cmdchar)

      // When
      const actual = handleDataSourceCommandSaga.next().value
      const expected = call(saga.handleDataSourceRemoveCommand, action, cmdchar)

      // Then
      expect(actual).to.deep.equal(expected)
    })
    it('should call handleDataSourceListCommand for list command', () => {
      // Given
      const action = {cmd: ':x list', id: 'x-x-x'}
      const cmdchar = ':'
      const handleDataSourceCommandSaga = saga.handleDataSourceCommand(action, cmdchar)

      // When
      const actual = handleDataSourceCommandSaga.next().value
      const expected = call(saga.handleDataSourceListCommand, action, cmdchar)

      // Then
      expect(actual).to.deep.equal(expected)
    })
    describe('handleDataSourceCreateCommand saga', () => {
      it('should add a datasource on successful validation', () => {
        // Given
        const props = {
          name: 'x',
          command: 'RETURN rand()',
          bookmarkId: 'uuid-of-existing-bookmark',
          refreshInterval: 10
        }
        const action = {
          cmd: ':x create ' + JSON.stringify(props),
          id: 'x-x-x'
        }
        const cmdchar = ':'
        const createSaga = saga.handleDataSourceCreateCommand(action, cmdchar)

        // When
        const actual = createSaga.next().value
        const expected = put(ds.actions.add({...action, ...props}))

        // Then
        expect(actual).to.deep.equal(expected)
      })
      it('should put a error frame on validation error', () => {
        // Given
        const props = { // No name
          command: 'RETURN rand()',
          bookmarkId: 'uuid-of-existing-bookmark',
          refreshInterval: 10
        }
        const action = {
          cmd: ':x create ' + JSON.stringify(props),
          id: 'x-x-x'
        }
        const cmdchar = ':'
        const createSaga = saga.handleDataSourceCreateCommand(action, cmdchar)

        // When
        const actual = createSaga.next().value
        const expected = put(frames.actions.add({
          ...action,
          error: (new CreateDataSourceValidationError()),
          type: 'error'
        }))

        // Then
        // Cannot deep equal complete object because of stack trace etc when thrown
        expect(actual.PUT.action.state.error.type).to.equal('CreateDataSourceValidationError')
        expect(actual.PUT.action.state.error.type).to.deep.equal(expected.PUT.action.state.error.type)
      })
    })
    describe('handleDataSourceRemoveCommand saga', () => {
      it('should remove a datasource on successful validation', () => {
        const dsuuid = 'y-y-y'
        const action = {
          cmd: ':x remove ' + dsuuid,
          id: 'x-x-x'
        }
        const cmdchar = ':'
        const removeSaga = saga.handleDataSourceRemoveCommand(action, cmdchar)

        // When
        const actual = removeSaga.next().value
        const expected = put(ds.actions.remove(dsuuid))

        // Then
        expect(actual).to.deep.equal(expected)
      })
      it('should put a error frame on validation error', () => {
        // Given
        const action = {
          cmd: ':x remove',
          id: 'x-x-x'
        }
        const cmdchar = ':'
        const removeSaga = saga.handleDataSourceRemoveCommand(action, cmdchar)

        // When
        const actual = removeSaga.next().value
        const expected = put(frames.actions.add({
          ...action,
          error: (new RemoveDataSourceValidationError()),
          type: 'error'
        }))

        // Then
        // Cannot deep equal complete object because of stack trace etc when thrown
        expect(actual.PUT.action.state.error.type).to.equal('RemoveDataSourceValidationError')
        expect(actual.PUT.action.state.error.type).to.deep.equal(expected.PUT.action.state.error.type)
      })
    })
    it('handleDataSourceListCommand should put a frame with existing datasources', () => {
      // Given
      const action = {cmd: ':x', id: 'x-x-x'}
      const cmdchar = ':'
      const listSaga = saga.handleDataSourceListCommand(action, cmdchar)
      const dataSources = [{name: 'myDS'}]

      // When
      listSaga.next() // state read
      const actual = listSaga.next(dataSources).value // pass dataSources to state read
      const expected = put(frames.actions.add({...action, contents: JSON.stringify(dataSources, null, 2), type: 'pre'}))

      // Then
      expect(actual).to.deep.equal(expected)
    })
  })
})
