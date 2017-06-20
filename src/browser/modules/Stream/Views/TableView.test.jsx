/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

/* global test, expect */
import React from 'react'
import { shallow } from 'enzyme'
import TableView from './TableView'

const testData = [
  ['a', 'n'],
  [
    {
      identity: '7',
      start: '8',
      end: '0',
      type: 'ACTED_IN',
      properties: {
        roles: ['Emil']
      }
    },
    {
      identity: '0',
      labels: ['Movie'],
      properties: {
        tagline: 'Welcome to the Real World',
        title: 'The Matrix',
        released: '1999'
      }
    }
  ],
  [
    {
      identity: '6',
      start: '7',
      end: '0',
      type: 'PRODUCED',
      properties: {}
    },
    {
      identity: '0',
      labels: ['Movie'],
      properties: {
        tagline: 'Welcome to the Real World',
        title: 'The Matrix',
        released: '1999'
      }
    }
  ]
]

describe('TableView', () => {
  test('should render headings', () => {
    const wrapper = shallow(<TableView data={testData} />)
    const tableHeaderElement = wrapper.find('th')
    expect(tableHeaderElement.first().text()).toBe(testData[0][0])
  })
  test('should render correct number of rows', () => {
    const wrapper = shallow(<TableView data={testData} />)
    expect(wrapper.find('.table-row').length).toBe(2)
  })
  test('should render properties', () => {
    const wrapper = shallow(<TableView data={testData} />)
    expect(wrapper.find('.table-properties').first().text()).toBe(
      JSON.stringify({
        roles: ['Emil']
      })
    )
    expect(wrapper.find('.table-properties').at(1).text()).toBe(
      JSON.stringify({
        tagline: 'Welcome to the Real World',
        title: 'The Matrix',
        released: '1999'
      })
    )
  })
  test('should render when properties are projected', () => {
    const newTestData = [['a'], ['testData']]
    const wrapper = shallow(<TableView data={newTestData} />)
    expect(wrapper.find('.table-properties').text()).toBe(
      JSON.stringify('testData')
    )
  })
})
