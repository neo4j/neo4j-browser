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

/* global test, expect, jest */
import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-addons-test-utils'
import { DatabaseInfo as DatabaseInfoComponent } from './DatabaseInfo'
import { mount } from 'enzyme'

function simulateEvent (wrappedTarget, eventType) {
  if (wrappedTarget.node) {
    // wrappedTarget was obtained using enzyme's mount()
    const domNode = ReactDOM.findDOMNode(wrappedTarget.node)
    ReactTestUtils.Simulate[eventType](domNode)
  } else {
    // wrappedTarget was obtained using enzyme's shallow()
    wrappedTarget.simulate(eventType)
  }
}

describe('DatabaseInfo', () => {
  const onItemClick = jest.fn()
  describe('labels', () => {
    test('should not show labels when there are no labels', () => {
      const labels = []
      const wrapper = mount(<DatabaseInfoComponent labels={labels} />)
      expect(wrapper.find('.token-label').length).toBe(0)
    })
    test('should show labels when there are labels', () => {
      const labels = [{ val: 'Person' }, { val: 'Movie' }]
      const wrapper = mount(<DatabaseInfoComponent labels={labels} />)
      expect(wrapper.find('.token-label').length).toBe(3)
      expect(
        wrapper
          .find('.token-label')
          .first()
          .text()
      ).toEqual('*')
    })
    test('should call on click callback with correct cypher * label is clicked', () => {
      const labels = [{ val: 'Person' }]
      const wrapper = mount(
        <DatabaseInfoComponent labels={labels} onItemClick={onItemClick} />
      )
      simulateEvent(wrapper.find('.token-label').first(), 'click')
      expect(onItemClick).toHaveBeenCalledWith('MATCH (n) RETURN n LIMIT 25')
    })
    test('should call on click callback with correct cypher when a non * label is clicked', () => {
      const labels = [{ val: 'Person' }]
      const wrapper = mount(
        <DatabaseInfoComponent labels={labels} onItemClick={onItemClick} />
      )
      simulateEvent(wrapper.find('.token-label').last(), 'click')
      expect(onItemClick).toHaveBeenCalledWith(
        'MATCH (n:Person) RETURN n LIMIT 25'
      )
    })
  })

  describe('relationshipTypes', () => {
    test('should not show relationshipTypes when there are no relationshipTypes', () => {
      const relationshipTypes = []
      const wrapper = mount(
        <DatabaseInfoComponent relationshipTypes={relationshipTypes} />
      )
      expect(wrapper.find('.token-relationship').length).toBe(0)
    })
    test('should show relationshipTypes when there are relationshipTypes', () => {
      const relationshipTypes = [{ val: 'lives' }, { val: 'knows' }]
      const wrapper = mount(
        <DatabaseInfoComponent relationshipTypes={relationshipTypes} />
      )
      expect(wrapper.find('.token-relationship').length).toBe(3)
      expect(
        wrapper
          .find('.token-relationship')
          .first()
          .text()
      ).toEqual('*')
    })
    test('should call on click callback with correct cypher when * relationship is clicked', () => {
      const relationshipTypes = [{ val: 'DIRECTED' }]
      const wrapper = mount(
        <DatabaseInfoComponent
          relationshipTypes={relationshipTypes}
          onItemClick={onItemClick}
        />
      )
      simulateEvent(wrapper.find('.token-relationship').first(), 'click')
      expect(onItemClick).toHaveBeenCalledWith(
        'MATCH p=()-->() RETURN p LIMIT 25'
      )
    })
    test('should call on click callback with correct cypher when a non * relationship is clicked', () => {
      const relationshipTypes = [{ val: 'DIRECTED' }]
      const wrapper = mount(
        <DatabaseInfoComponent
          relationshipTypes={relationshipTypes}
          onItemClick={onItemClick}
        />
      )
      simulateEvent(wrapper.find('.token-relationship').last(), 'click')
      expect(onItemClick).toHaveBeenCalledWith(
        'MATCH p=()-[r:DIRECTED]->() RETURN p LIMIT 25'
      )
    })
  })

  describe('properties', () => {
    test('should not show properties when there are no properties', () => {
      const properties = []
      const wrapper = mount(<DatabaseInfoComponent properties={properties} />)
      expect(wrapper.find('.token-property').length).toBe(0)
    })
    test('should show properties when there are properties', () => {
      const properties = [{ val: 'born' }, { val: 'name' }]
      const wrapper = mount(<DatabaseInfoComponent properties={properties} />)
      expect(wrapper.find('.token-property').length).toBe(2)
      expect(
        wrapper
          .find('.token-property')
          .first()
          .text()
      ).toEqual('born')
    })
    test('should call on click callback with correct cypher when property is clicked', () => {
      const properties = [{ val: 'born' }]
      const wrapper = mount(
        <DatabaseInfoComponent
          properties={properties}
          onItemClick={onItemClick}
        />
      )
      simulateEvent(wrapper.find('.token-property').first(), 'click')
      expect(onItemClick).toHaveBeenCalledWith(
        'MATCH (n) WHERE EXISTS(n.born) RETURN DISTINCT "node" as element, n.born AS born LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.born) RETURN DISTINCT "relationship" AS element, r.born AS born LIMIT 25'
      )
    })
  })
})
