import React from 'react'
import sidebar from '../'
import { expect } from 'chai'
import { mount } from 'enzyme'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import dbInfo from '../dbInfo'

describe('Sidebar', () => {
  const reducer = combineReducers({
    meta: dbInfo.reducer
  })
  const store = createStore(reducer)

  it('should show db drawer whem it is open', () => {
    const drawer = 'db'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-drawer')).has.length(1)
  })

  it('should show fav drawer whem it is open', () => {
    const drawer = 'fav'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('.tab').first().text()).to.equal('Fav')
  })
})
