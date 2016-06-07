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

  it('should show list of favorites', () => {
    const favorites = [{id: '1', content: '//Test1 Hello'}, {id: '2', content: '//Test2 Again'}]
    const wrapper = mount(<Provider store={store}><FavoritesComponent scripts={favorites} dispatch={() => null}/></Provider>)
    expect(wrapper.find('.favorite')).to.have.length(2)
  })
})
