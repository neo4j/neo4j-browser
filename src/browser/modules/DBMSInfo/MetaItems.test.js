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

import React from 'react'
import { render } from '@testing-library/react'

import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'

test('LabelItems renders empty', () => {
  const items = []
  const { container } = render(<LabelItems labels={items} />)
  expect(container).toMatchSnapshot()
})
test('LabelItems renders labels', () => {
  const items = ['MyLabel', 'MyLabel2']
  const { container } = render(<LabelItems labels={items} />)
  expect(container).toMatchSnapshot()
})
test('RelationshipItems renders empty', () => {
  const items = []
  const { container } = render(<RelationshipItems relationshipTypes={items} />)
  expect(container).toMatchSnapshot()
})
test('RelationshipItems renders relationshipTypes', () => {
  const items = ['MY_TYPE', 'MY_TYPE2']
  const { container } = render(<RelationshipItems relationshipTypes={items} />)
  expect(container).toMatchSnapshot()
})
test('PropertyItems renders empty', () => {
  const items = []
  const { container } = render(<PropertyItems properties={items} />)
  expect(container).toMatchSnapshot()
})
test('PropertyItems renders properties', () => {
  const items = ['prop1', 'prop2']
  const { container } = render(<PropertyItems properties={items} />)
  expect(container).toMatchSnapshot()
})
