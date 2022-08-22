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
import { render } from '@testing-library/react'
import neo4j from 'neo4j-driver'
import React from 'react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import { Bus } from 'suber'

import { Visualization, VisualizationProps } from './VisualizationView'

const mockBus = {
  self: jest.fn(),
  send: jest.fn()
} as unknown as Bus

function mockVizProps(
  overrides?: Partial<VisualizationProps>
): VisualizationProps {
  return {
    updated: 23,
    maxNeighbours: 200,
    autoComplete: false,
    assignVisElement: () => undefined,
    bus: mockBus,
    isFullscreen: false,
    initialNodeDisplay: 400,
    maxFieldItems: 200,
    result: null,
    graphStyleData: null,
    updateStyle: () => undefined,
    nodePropertiesExpandedByDefault: true,
    setNodePropertiesExpandedByDefault: jest.fn(),
    wheelZoomInfoMessageEnabled: false,
    disableWheelZoomInfoMessage: jest.fn(),
    ...overrides
  }
}
const mockStore = configureMockStore()
const store = mockStore({
  frames: {},
  settings: {}
})

function renderWithRedux(children: JSX.Element) {
  return render(<Provider store={store}>{children}</Provider>)
}
const mockEmptyResult = {
  records: []
}

test('Visualization renders empty content', () => {
  const { container } = renderWithRedux(
    <Visualization {...mockVizProps({ result: mockEmptyResult })} />
  )
  expect(container).toMatchSnapshot()
})
