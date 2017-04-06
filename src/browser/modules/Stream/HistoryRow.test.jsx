/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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
