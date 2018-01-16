/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global test, expect */
import React from 'react'
import { Favorites as FavoritesComponent } from './Favorites'

import { shallow } from 'enzyme'
import Favorite from './Favorite'

describe('FavoritesComponent', () => {
  test('should show list of favorites', () => {
    const favorites = [
      { id: '1', content: '//Test1 Hello' },
      { id: '2', content: '//Test2 Again' }
    ]
    const wrapper = shallow(
      <FavoritesComponent scripts={favorites} dispatch={() => null} />
    )
    expect(wrapper.find(Favorite).length).toBe(2)
  })
})
