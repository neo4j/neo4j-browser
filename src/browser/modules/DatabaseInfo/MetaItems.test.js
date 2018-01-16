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

/* global jest, test, expect */

import { mount } from 'services/testUtils'
import { ecsapeCypherMetaItem } from 'services/utils'
import { LabelItems, RelationshipItems } from './MetaItems.jsx'

test('LabelItems detects user defined label named * and creates query correctly', () => {
  // Given
  const onItemClick = jest.fn()
  const labels = ['*', 'Label1']

  // When
  return mount(LabelItems)
    .withProps({
      labels,
      totalNumItems: labels.length,
      onItemClick
    })
    .then(wrapper => {
      const items = wrapper.find(`[data-test-id='sidebarMetaItem']`)
      items.forEach((item, i) => {
        const element = item.get(0)
        element.click()
        const expectedCall =
          i === 0
            ? 'MATCH (n) RETURN n LIMIT 25'
            : `MATCH (n:${ecsapeCypherMetaItem(item.text())}) RETURN n LIMIT 25`
        expect(onItemClick).toHaveBeenLastCalledWith(expectedCall)
      })
    })
})

test('RelationshipItems detects user defined relType named * and creates query correctly', () => {
  // Given
  const onItemClick = jest.fn()
  const relationshipTypes = ['*', 'TYPE1']

  // When
  return mount(RelationshipItems)
    .withProps({
      relationshipTypes,
      totalNumItems: relationshipTypes.length,
      onItemClick
    })
    .then(wrapper => {
      const items = wrapper.find(`[data-test-id='sidebarMetaItem']`)
      items.forEach((item, i) => {
        const element = item.get(0)
        element.click()
        const expectedCall =
          i === 0
            ? 'MATCH p=()-->() RETURN p LIMIT 25'
            : `MATCH p=()-[r:${ecsapeCypherMetaItem(
              item.text()
            )}]->() RETURN p LIMIT 25`
        expect(onItemClick).toHaveBeenLastCalledWith(expectedCall)
      })
    })
})
