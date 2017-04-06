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

/* global test, expect */
import React from 'react'
import { mount } from 'enzyme'
import Settings, { Settings as SettingsComponent } from './Settings'
import reducer from 'shared/modules/settings/settingsDuck'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'preact-redux'

describe('Settings', () => {
  const r = combineReducers({
    settings: reducer
  })
  const store = createStore(r)

  test('should show known setting values', () => {
    const wrapper = mount(
      <SettingsComponent settings={{ cmdchar: '-', maxHistory: 0 }} />
    )
    expect(wrapper.find('.setting').first().find('input').prop('defaultValue')).toBe(0)
  })
  test('should show default settings', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Settings />
      </Provider>
    )
    expect(wrapper.find('#db-settings').length).toBe(1)
    expect(wrapper.find('input').length).toBe(1)
    expect(wrapper.find('.setting').first().find('input').prop('defaultValue')).toBe(10)
  })
  test('should not show unknown settings', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Settings settings={{ a: 'b' }} />
      </Provider>
    )
    expect(wrapper.find('.setting').first().find('input').prop('defaultValue')).toBe(10)
  })
})
