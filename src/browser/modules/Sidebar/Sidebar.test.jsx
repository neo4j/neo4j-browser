import React from 'react'
import { expect } from 'chai'
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
    documents: (a) => a || null,
    settings
  })
  const store = createStore(reducer)

  it('should show db drawer when it is open', () => {
    const drawer = 'db'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(DatabaseInfo)).to.have.length(1)
  })

  it('should show favorites drawer when it is open', () => {
    const drawer = 'favorites'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Favorites)).to.have.length(1)
  })

  it('should show documents drawer when it is open', () => {
    const drawer = 'documents'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Documents)).to.have.length(1)
  })

  it('should show settings drawer when it is open', () => {
    const drawer = 'settings'
    const wrapper = mount(
      <Provider store={store}>
        <Sidebar openDrawer={drawer} />
      </Provider>
    )
    expect(wrapper.find(Settings)).to.have.length(1)
  })
})
