import React from 'react'

import { expect } from 'chai'
import { mount } from 'enzyme'
import Settings, { Settings as SettingsComponent } from './Settings'
import reducer from '../../../shared/modules/settings/settingsDuck'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

describe('Settings', () => {
  const r = combineReducers({
    settings: reducer
  })
  const store = createStore(r)

  it('should show known setting values', () => {
    const wrapper = mount(
      <SettingsComponent settings={{ cmdchar: '-', maxHistory: 0 }} />
    )
    expect(wrapper.find('.setting').at(0).find('input')).to.have.value('-')
    expect(wrapper.find('.setting').at(1).find('input')).to.have.value('0')
  })
  it('should show default settings', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Settings />
      </Provider>
    )
    expect(wrapper.find('#db-settings')).has.length(1)
    expect(wrapper.find('input')).has.length(2)
    expect(wrapper.find('.setting').at(0).find('input')).to.have.value(':')
    expect(wrapper.find('.setting').at(1).find('input')).to.have.value('10')
  })
  it('should not show unknown settings', () => {
    const wrapper = mount(
      <Provider store={store}>
        <Settings settings={{ a: 'b' }} />
      </Provider>
    )
    expect(wrapper.find('.setting').at(0).find('input')).to.have.value(':')
    expect(wrapper.find('.setting').at(1).find('input')).to.have.value('10')
  })
})
