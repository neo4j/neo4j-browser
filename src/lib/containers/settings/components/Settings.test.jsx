import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { expect } from 'chai'
import { mount } from 'enzyme'
import Settings, {SettingsComponent} from './Settings'
import reducer from './../reducer'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

describe('Settings', () => {
  const r = combineReducers({
    settings: reducer
  })
  const store = createStore(r)

  it('should show known setting values', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <SettingsComponent settings={{ cmdchar: '-', maxHistory: 0 }}/>
      </MuiThemeProvider>
    )
    expect(wrapper.find('.setting').at(0).find('input')).to.have.value('-')
    expect(wrapper.find('.setting').at(1).find('input')).to.have.value('0')
  })
  it('should show default settings', () => {
    const wrapper = mount(
      <Provider store={store}>
        <MuiThemeProvider>
          <Settings />
        </MuiThemeProvider>
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
        <MuiThemeProvider>
          <Settings settings={{ a: 'b' }}/>
        </MuiThemeProvider>
      </Provider>
    )
    expect(wrapper.find('.setting').at(0).find('input')).to.have.value(':')
    expect(wrapper.find('.setting').at(1).find('input')).to.have.value('10')
  })
})
