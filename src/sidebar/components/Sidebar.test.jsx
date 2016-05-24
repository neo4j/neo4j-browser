import React from 'react'
import sidebar from '../'
import { expect } from 'chai'
import { mount } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

describe('Sidebar', () => {
  const store = createStore(sidebar.reducer)

  it('shopuld show db drawer whem it is open', () => {
    const drawer = 'db'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('#db-drawer')).has.length(1)
  })

  it('shopuld show fav drawer whem it is open', () => {
    const drawer = 'fav'
    const wrapper = mount(<Provider store={store}><sidebar.components.Sidebar openDrawer={drawer} onNavClick={() => {}}/></Provider>)
    expect(wrapper.find('.tab').first().text()).to.equal('Fav')
  })
})
