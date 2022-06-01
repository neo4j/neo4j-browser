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
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import Navigation from './Navigation'

describe('<Navigation />', () => {
  const div = (testid: string) =>
    function TestDiv() {
      return <div data-testid={testid}></div>
    }

  const topNavItems = [
    {
      name: 'DBMS',
      title: 'DBMS',
      icon: div('dbms-icon'),
      content: div('dbms-content')
    },
    {
      name: 'Favorites',
      title: 'Favorites',
      icon: div('favorites-icon'),
      content: div('favorites-icon')
    }
  ]

  const bottomNavItems = [
    {
      name: 'Documents',
      title: 'Help &amp; Resources',
      icon: div('documents-icon'),
      content: div('documents-content'),
      enableCannyBadge: true
    }
  ]

  // recreation of reducer logic
  const toggleDrawer = (current: string | null, clicked: string) =>
    clicked && clicked !== current ? clicked : null

  it('should open drawer when button is clicked on closed drawer', () => {
    let selectedDrawerName: string | null = ''
    const onNavClick = (clickedDrawerName: string) => {
      selectedDrawerName = toggleDrawer(selectedDrawerName, clickedDrawerName)
    }

    // render with closed drawer
    const { rerender } = render(
      <Navigation
        onNavClick={onNavClick}
        selectedDrawerName={selectedDrawerName}
        topNavItems={topNavItems}
        bottomNavItems={bottomNavItems}
      />
    )

    // click documents button
    fireEvent.click(screen.getByTestId('documents-icon'))

    // rerender with updated selectedDrawerName value
    rerender(
      <Navigation
        onNavClick={onNavClick}
        selectedDrawerName={selectedDrawerName}
        topNavItems={topNavItems}
        bottomNavItems={bottomNavItems}
      />
    )

    // expect documents drawer to be open
    expect(screen.queryByTestId('documents-content')).toBeTruthy()
  })

  it('should switch drawer when different button is clicked than currently open', () => {
    let selectedDrawerName: string | null = 'documents'
    const onNavClick = (clickedDrawerName: string) => {
      selectedDrawerName = toggleDrawer(selectedDrawerName, clickedDrawerName)
    }

    // render with documents drawer open
    const { rerender } = render(
      <Navigation
        onNavClick={onNavClick}
        selectedDrawerName={selectedDrawerName}
        topNavItems={topNavItems}
        bottomNavItems={bottomNavItems}
      />
    )

    // click DBMS button
    fireEvent.click(screen.getByTestId('dbms-icon'))

    // rerender with updated selectedDrawerName value
    rerender(
      <Navigation
        onNavClick={onNavClick}
        selectedDrawerName={selectedDrawerName}
        topNavItems={topNavItems}
        bottomNavItems={bottomNavItems}
      />
    )

    // expect DBMS drawer to be open
    expect(screen.queryByTestId('dbms-content')).toBeTruthy()
    expect(screen.queryByTestId('documents-content')).toBeNull()
  })
})
