import React from 'react'
import { FavoritesComponent } from './Favorites'
import { createStore, combineReducers } from 'redux'
import { expect } from 'chai'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import favorites from '../../favorites'

describe('FavoritesComponent', () => {
  const reducer = combineReducers({
    favorites: favorites.reducer
  })
  const store = createStore(reducer)

  it('should show list of favorties', () => {
    const favorties = {scripts: [{name: 'Hello', content: '//Test'}, {name: 'Hello', content: '//Test'}]}
    const wrapper = mount(<Provider store={store}><FavoritesComponent favorties={favorties}/></Provider>)
    expect(wrapper.find('.favorite')).to.have.length(1)
  })
})
