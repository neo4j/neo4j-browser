/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

/* global jest, describe, test, expect */

import { mount } from 'services/testUtils'
import { CypherFrame } from './index'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'

const toBoltRecord = obj => {
  const keys = Object.keys(obj)
  const vals = keys.map(key => obj[key])
  return {
    get: x => obj[x],
    forEach: fn => {
      keys.forEach(key => fn(obj[key], key))
    },
    keys,
    _fields: vals
  }
}

jest.mock('./VisualizationView', () => {
  return {
    VisualizationConnectedBus: () => {
      return {
        render: () => null
      }
    }
  }
})
jest.mock('react-suber', () => {
  return {
    withBus: a => a
  }
})
jest.mock('react-redux', () => {
  return {
    connect: (msp, mdp) => a => a
  }
})
describe('CypherFrame', () => {
  test('shows a spinner while pending request and switches to ERRORS view when failing', () => {
    // Given
    const request = {
      status: 'pending'
    }
    const failedRequest = {
      status: 'error'
    }
    const result = mount(CypherFrame)
      .withProps({ request, frame: { cmd: '' } })
      // Then
      .then(wrapper => {
        expect(wrapper.html()).toContain('fa-spinner')
        return wrapper
      })
      .then(wrapper => {
        wrapper.setProps({ request: failedRequest })
        wrapper.update()
        expect(wrapper.html()).not.toContain('fa-spinner')
        expect(wrapper.instance().state.openView).toEqual(viewTypes.ERRORS)
      })

    // Return test result (promise)
    return result
  })
  test.skip('renders table view if no nodes', () => {
    // I have no idea why this doesn't work
    // Given
    const request = {
      status: 'success',
      result: {
        records: [toBoltRecord({ x: 'x' }), toBoltRecord({ y: 'y' })]
      }
    }
    const result = mount(CypherFrame)
      .withProps({ request, maxRows: 100, frame: { cmd: '' } })
      // Then
      .then(wrapper => {
        wrapper.update()
        expect(wrapper.html()).toContain('<table>')
        expect(wrapper.instance().state.openView).toEqual(viewTypes.TABLE)
      })
    // Return test result (promise)
    return result
  })
  test('renders errors view if error', () => {
    // Given
    const request = {
      status: 'error',
      result: {
        code: 'Test.Error',
        message: 'My error'
      }
    }
    const result = mount(CypherFrame)
      .withProps({ request, maxRows: 100, frame: { cmd: '' } })
      // Then
      .then(wrapper => {
        wrapper.update()
        expect(wrapper.text()).toContain('Test.Error')
        expect(wrapper.instance().state.openView).toEqual(viewTypes.ERRORS)
      })
    // Return test result (promise)
    return result
  })
  test("renders text view if it's the recent one", () => {
    // Given
    const request = {
      status: 'success',
      result: {
        records: [toBoltRecord({ x: 'x' }), toBoltRecord({ y: 'y' })]
      }
    }
    const result = mount(CypherFrame)
      .withProps({
        request,
        maxRows: 100,
        recentView: viewTypes.TEXT,
        frame: { cmd: '' }
      })
      // Then
      .then(wrapper => {
        wrapper.update()
        expect(wrapper.text()).toContain('Max column width')
        expect(wrapper.instance().state.openView).toEqual(viewTypes.TEXT)
      })
    // Return test result (promise)
    return result
  })
})
