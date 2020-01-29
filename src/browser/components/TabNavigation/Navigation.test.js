/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import Navigation from './Navigation'

describe('<Navigation />', () => {
  const div = testid => () => <div data-testid={testid}></div>

  const topNavItems = [
    {
      name: 'Documents',
      title: 'Documentation',
      icon: div('documents-icon'),
      content: div('documents-content')
    },
    {
      name: 'DBMS',
      title: 'DBMS',
      icon: div('dbms-icon'),
      content: div('dbms-content')
    }
  ]

  // recreation of reducer logic
  const toggleDrawer = (current, clicked) =>
    clicked && clicked !== current ? clicked : null

  it('should open drawer when button is clicked on closed drawer', () => {
    let openDrawer = ''
    const onNavClick = clickedDrawer => {
      openDrawer = toggleDrawer(openDrawer, clickedDrawer)
    }

    // render with closed drawer
    const { getByTestId, queryByTestId, rerender } = render(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // click documents button
    fireEvent.click(getByTestId('documents-icon'))

    // rerender with updated openDrawer value
    rerender(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // expect documents drawer to be open
    expect(queryByTestId('documents-content')).toBeTruthy()
  })

  it('should close drawer when button is clicked on open drawer', () => {
    let openDrawer = 'documents'
    const onNavClick = clickedDrawer => {
      openDrawer = toggleDrawer(openDrawer, clickedDrawer)
    }

    // render with documents drawer open
    const { getByTestId, queryByTestId, rerender } = render(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // click documents button
    fireEvent.click(getByTestId('documents-icon'))

    // rerender with updated openDrawer value
    rerender(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // expect drawer to be closed
    expect(queryByTestId('documents-content')).toBeNull()
    expect(queryByTestId('dbms-content')).toBeNull()
  })

  it('should switch drawer when different button is clicked than currently open', () => {
    let openDrawer = 'documents'
    const onNavClick = clickedDrawer => {
      openDrawer = toggleDrawer(openDrawer, clickedDrawer)
    }

    // render with documents drawer open
    const { getByTestId, queryByTestId, rerender } = render(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // click DBMS button
    fireEvent.click(getByTestId('dbms-icon'))

    // rerender with updated openDrawer value
    rerender(
      <Navigation
        onNavClick={onNavClick}
        openDrawer={openDrawer}
        topNavItems={topNavItems}
      />
    )

    // expect DBMS drawer to be open
    expect(queryByTestId('dbms-content')).toBeTruthy()
    expect(queryByTestId('documents-content')).toBeNull()
  })
})
