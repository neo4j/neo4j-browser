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
import { shallow, mount } from 'enzyme'
import { Favorite as FavoriteComponent } from './Favorite'

describe('FavoriteComponent', () => {
  describe('should show name of script', () => {
    const testCases = [
      {
        command: '//Test script \nABC',
        expected: 'Test script'
      },
      {
        command: '//Test script ABC',
        expected: 'Test script ABC'
      },
      {
        command: '// Test script ABC   ',
        expected: 'Test script ABC'
      },
      {
        command: '// Test \n\n\nscript ABC   ',
        expected: 'Test'
      },
      {
        command: '// //Test//',
        expected: '//Test//'
      }
    ]
    testCases.forEach((testCase, i) => {
      test(`should extract name of script from case ${i}`, () => {
        const wrapper = shallow(
          <FavoriteComponent content={testCase.command} />
        )
        const item = wrapper.find('.favorite')
        expect(item.length).toBe(1)
        expect(item.props().primaryText).toEqual(testCase.expected)
      })
    })
  })

  test('should show tigger event with content of script', () => {
    const onItemClick = jest.fn()
    const wrapper = shallow(
      <FavoriteComponent content={'Cypher'} onItemClick={onItemClick} />
    )
    const favoriteElement = wrapper.find('.favorite')
    expect(favoriteElement.length).toBe(1)
    favoriteElement.first().simulate('click')
    expect(onItemClick).toHaveBeenCalledWith('Cypher')
  })

  test('should remove favorite that has been clicked', () => {
    const id = 'SomeId'
    const onRemoveClick = jest.fn()
    const wrapper = mount(
      <FavoriteComponent id={id} content='hej' removeClick={onRemoveClick} />
    )
    const favoriteElement = wrapper.find('.favorite')
    expect(favoriteElement.length).toBe(1)
    wrapper.find('.remove').simulate('click')
    expect(onRemoveClick).toHaveBeenCalledWith('SomeId')
  })
})
