import React from 'react'
import sidebar from '../'
import { expect } from 'chai'
import { mount } from 'enzyme'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import dbInfo from '../dbInfo'
import favorites from '../favorites'

describe('Sidebar', () => {
  const reducer = combineReducers({
    meta: dbInfo.reducer,
    favorites: favorites.reducer
  })
  const store = createStore(reducer)

  it('should show db drawer whem it is open', () => {
    const drawer = 'db'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-drawer')).has.length(1)
  })

  it('should show favorites drawer when it is open', () => {
    const drawer = 'favorites'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-favorites')).has.length(1)
  })
})
