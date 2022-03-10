/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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
import { render } from '@testing-library/react'
import React from 'react'
// eslint-disable-next-line no-restricted-imports
import { Provider } from 'react-redux'
// eslint-disable-next-line no-restricted-imports
import { combineReducers, createStore } from 'redux'

import { GrassEditor } from './GrassEditor'
// eslint-disable-next-line no-restricted-imports
import reducers from 'shared/rootReducer'

describe('<GrassEditor />', () => {
  it('loads style rules on style option click', () => {
    const reducer = combineReducers({ ...(reducers as any) })
    const store: any = createStore(reducer)
    const { container } = render(
      <Provider store={store}>
        <GrassEditor
          selectedLabel={{
            label: 'foo',
            propertyKeys: []
          }}
        />
      </Provider>
    )

    const largestSizeOption = container.querySelector(
      '[data-testid="size-picker"] li:last-of-type a'
    ) as HTMLElement

    // Click style option to trigger redux action resulting in new graphStyleData
    largestSizeOption.click()

    // Expect clicked size option to be active
    expect(largestSizeOption.classList.contains('active')).toBe(true)
  })
})
