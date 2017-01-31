/* global test, expect */
import React from 'react'
import { Favorites as FavoritesComponent } from './Favorites'

import { shallow } from 'enzyme'
import Favorite from './Favorite'

describe('FavoritesComponent', () => {
  test('should show list of favorites', () => {
    const favorites = [{id: '1', content: '//Test1 Hello'}, {id: '2', content: '//Test2 Again'}]
    const wrapper = shallow(<FavoritesComponent scripts={favorites} dispatch={() => null} />)
    expect(wrapper.find(Favorite).length).toBe(2)
  })
})
