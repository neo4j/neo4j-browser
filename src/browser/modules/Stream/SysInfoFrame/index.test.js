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

import uuid from 'uuid'
import { mount } from 'services/testUtils'
import { SysInfoFrame } from './index'

jest.mock(
  'browser/modules/Stream/FrameTemplate',
  () => ({ contents, children }) => (
    <div>
      {contents}
      {children}
    </div>
  )
)

describe('sysinfo component', () => {
  test('should render causal cluster table', () => {
    return mount(SysInfoFrame)
      .withProps({ isACausalCluster: true, isConnected: true })
      .then(wrapper => {
        expect(wrapper.html()).toContain('Causal Cluster Members')
      })
  })
  test('should not render causal cluster table', () => {
    return mount(SysInfoFrame)
      .withProps({ isACausalCluster: false, isConnected: true })
      .then(wrapper => {
        expect(wrapper.html()).not.toContain('Causal Cluster Members')
      })
  })
  test('should not render ha table', () => {
    const value = uuid.v4()
    const label = 'InstanceId'
    return mount(SysInfoFrame)
      .withProps({ isConnected: true })
      .then(wrapper => {
        expect(wrapper.html()).not.toContain(label)
        expect(wrapper.html()).not.toContain(value)

        wrapper.setState({ ha: [{ label, value }] })
        wrapper.update()

        expect(wrapper.html()).toContain(label)
        expect(wrapper.html()).toContain(value)
      })
  })
  test('should display error when there is no connection', () => {
    return mount(SysInfoFrame)
      .withProps({ isConnected: false })
      .then(wrapper => {
        expect(wrapper.state('error')).toBe('No connection available')
      })
  })
})
