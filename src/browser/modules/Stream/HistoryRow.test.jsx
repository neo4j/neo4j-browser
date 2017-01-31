/* global test, expect, jest */
import React from 'react'
import { shallow } from 'enzyme'
import HistoryRow from './HistoryRow'

describe('HistoryRow', () => {
  test('should render an entry', () => {
    const entry = {id: 1, cmd: ':first', type: 'x'}
    const wrapper = shallow(<HistoryRow entry={entry} handleEntryClick={() => null} />)
    expect(wrapper.find('li').length).toBe(1)
    expect(wrapper.find('li').text()).toMatch(':first')
  })

  test('should handle clicks', () => {
    const handleEntryClick = jest.fn()
    const entry = {id: 1, cmd: ':first', type: 'x'}
    const wrapper = shallow(<HistoryRow entry={entry} handleEntryClick={handleEntryClick} />)
    wrapper.find('li').simulate('click')
    expect(handleEntryClick).toHaveBeenCalledWith(entry.cmd)
  })
})
