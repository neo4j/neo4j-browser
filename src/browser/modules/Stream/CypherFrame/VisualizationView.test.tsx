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

import React from 'react'
import { render } from '@testing-library/react'
import neo4j from 'neo4j-driver'
import { Visualization } from './VisualizationView'
import { createBus } from 'suber'

const mockEmptyResult = {
  records: []
}
const node = new (neo4j.types.Node as any)('1', ['Person'], {
  prop1: '<b>String</b> with HTML <strong>in</strong> it'
})
const mockResult = {
  records: [{ keys: ['0'], __fields: [node], get: () => node }]
}

const props = {
  assignVisElement: () => undefined,
  autoComplete: false,
  bus: createBus(),
  frameHeight: '300px',
  graphStyleData: null,
  initialNodeDisplay: 10,
  maxFieldItems: 100,
  maxNeighbours: 100,
  updateStyle: () => undefined,
  updated: 0
}
test('Visualization renders', () => {
  const { container } = render(
    <Visualization {...props} result={mockEmptyResult} />
  )
  expect(container).toMatchSnapshot()
})

test('Visualization renders with result and escapes any HTML', () => {
  const { container } = render(<Visualization {...props} result={mockResult} />)
  expect(container).toMatchSnapshot()
})
