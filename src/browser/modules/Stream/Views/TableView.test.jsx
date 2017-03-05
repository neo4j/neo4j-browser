/* global test, expect */
import React from 'react'
import { shallow } from 'enzyme'
import TableView from './TableView'

const testData =
  [
    [
      'a',
      'n'
    ],
    [
      {
        'identity': '7',
        'start': '8',
        'end': '0',
        'type': 'ACTED_IN',
        'properties': {
          'roles': [
            'Emil'
          ]
        }
      },
      {
        'identity': '0',
        'labels': [
          'Movie'
        ],
        'properties': {
          'tagline': 'Welcome to the Real World',
          'title': 'The Matrix',
          'released': '1999'
        }
      }
    ],
    [
      {
        'identity': '6',
        'start': '7',
        'end': '0',
        'type': 'PRODUCED',
        'properties': {}
      },
      {
        'identity': '0',
        'labels': [
          'Movie'
        ],
        'properties': {
          'tagline': 'Welcome to the Real World',
          'title': 'The Matrix',
          'released': '1999'
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
    expect(wrapper.find('.table-properties').first().text()).toBe(JSON.stringify({
      'roles': [
        'Emil'
      ]
    }))
    expect(wrapper.find('.table-properties').at(1).text()).toBe(JSON.stringify({
      'tagline': 'Welcome to the Real World',
      'title': 'The Matrix',
      'released': '1999'
    }))
  })
  test('should render when properties are projected', () => {
    const newTestData = [['a'], ['testData']]
    const wrapper = shallow(<TableView data={newTestData} />)
    expect(wrapper.find('.table-properties').text()).toBe(JSON.stringify('testData'))
  })
})
