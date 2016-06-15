import React from 'react'
import sidebar from '../'
import { expect } from 'chai'
import { mount } from 'enzyme'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import dbInfo from '../dbInfo'
import favorites from '../favorites'
import documents from '../documents'
import settings from '../../settings'

describe('Sidebar', () => {
  const reducer = combineReducers({
    meta: dbInfo.reducer,
    favorites: favorites.reducer,
    documents: documents.reducer,
    settings: settings.reducer
  })
  const store = createStore(reducer)

  it('should show db drawer when it is open', () => {
    const drawer = 'db'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-drawer')).has.length(1)
  })

  it('should show favorites drawer when it is open', () => {
    const drawer = 'favorites'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-favorites')).has.length(1)
  })

  it('should show documents drawer when it is open', () => {
    const drawer = 'documents'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-documents')).has.length(1)
  })

  it('should show settings drawer when it is open', () => {
    const drawer = 'settings'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-settings')).has.length(1)
  })
})
