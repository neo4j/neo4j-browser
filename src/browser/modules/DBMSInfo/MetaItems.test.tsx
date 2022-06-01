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
import { render, screen } from '@testing-library/react'
import React from 'react'

import { LabelItems, PropertyItems, RelationshipItems } from './MetaItems'

const renderLabelItems = (
  items: string[] = [],
  moreStep = 5,
  totalNumItems: number = items.length
) => {
  return render(
    <LabelItems
      labels={items}
      count={5}
      graphStyleData={''}
      moreStep={moreStep}
      onItemClick={jest.fn()}
      onMoreClick={jest.fn()}
      totalNumItems={totalNumItems}
    />
  )
}

const renderPropertyItems = (
  items: string[] = [],
  moreStep = 5,
  totalNumItems: number = items.length
) => {
  return render(
    <PropertyItems
      properties={items}
      moreStep={moreStep}
      onItemClick={jest.fn()}
      onMoreClick={jest.fn()}
      totalNumItems={totalNumItems}
    />
  )
}

const renderRelationshipItems = (
  items: string[] = [],
  moreStep = 5,
  totalNumItems: number = items.length
) => {
  return render(
    <RelationshipItems
      relationshipTypes={items}
      moreStep={moreStep}
      onItemClick={jest.fn()}
      onMoreClick={jest.fn()}
      totalNumItems={totalNumItems}
      count={5}
      graphStyleData={''}
    />
  )
}

test('LabelItems renders empty', () => {
  const { container } = renderLabelItems([])
  expect(container).toMatchSnapshot()
})
test('LabelItems renders labels', () => {
  const items = ['MyLabel', 'MyLabel2']
  const { container } = renderLabelItems(items)
  expect(container).toMatchSnapshot()
})
test('RelationshipItems renders empty', () => {
  const { container } = renderRelationshipItems([])
  expect(container).toMatchSnapshot()
})
test('RelationshipItems renders relationshipTypes', () => {
  const items = ['MY_TYPE', 'MY_TYPE2']
  const { container } = renderRelationshipItems(items)
  expect(container).toMatchSnapshot()
})
test('PropertyItems renders empty', () => {
  const { container } = renderPropertyItems([])
  expect(container).toMatchSnapshot()
})
test('PropertyItems renders properties', () => {
  const items = ['prop1', 'prop2']
  const { container } = renderPropertyItems(items)
  expect(container).toMatchSnapshot()
})
test('PropertyItems with more than step size properties shows "Show all" link', () => {
  const items = Array.from({ length: 6 }).map(
    (_value: any, index: number) => `prop${index}`
  )
  renderPropertyItems(items, 5, 10)
  expect(screen.getByText('Show all')).toBeInTheDocument()
})
