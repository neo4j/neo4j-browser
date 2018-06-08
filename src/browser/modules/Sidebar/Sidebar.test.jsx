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

/* global test, expect */
import React from 'react'
import { mount } from 'enzyme'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import Sidebar from './Sidebar'
import DatabaseInfo from '../DatabaseInfo/DatabaseInfo'
import Favorites from './Favorites'
import Documents from './Documents'
import Settings from './Settings'
import favorites from '../../../shared/modules/favorites/favoritesDuck'
import settings from '../../../shared/modules/settings/settingsDuck'

describe('Sidebar', () => {
  const reducer = combineReducers({
    favorites,
    documents: a => a || null,
    settings
  })
  const store = createStore(reducer)

  test('should show db drawer when it is open', () => {
    const drawer = 'db'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(DatabaseInfo).length).toBe(1)
  })

  test('should show favorites drawer when it is open', () => {
    const drawer = 'favorites'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Favorites).length).toBe(1)
  })

  test('should show documents drawer when it is open', () => {
    const drawer = 'documents'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Documents).length).toBe(1)
  })

  test('should show settings drawer when it is open', () => {
    const drawer = 'settings'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Settings).length).toBe(1)
  })
})
