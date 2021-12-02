/*
 * Copyright (c) "Neo4j"
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

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore, { MockStoreEnhanced } from 'redux-mock-store'
import { Guide } from 'browser/documentation'
import { GuideDrawerProps, GuideDrawer } from './GuideDrawer'
import { RemoteGuide } from 'shared/modules/guides/guidesDuck'

const createProps = (
  currentGuide: Guide | null,
  remoteGuides: RemoteGuide[]
): GuideDrawerProps => ({
  currentGuide: currentGuide,
  remoteGuides: remoteGuides,
  backToAllGuides: () => undefined,
  gotoSlide: () => undefined,
  setCurrentGuide: () => undefined,
  fetchRemoteGuide: () => undefined,
  updateRemoteGuides: () => undefined
})

const mockStore = configureMockStore()

const renderWithRedux = (
  store: MockStoreEnhanced<unknown>,
  children: JSX.Element
) => {
  return render(<Provider store={store}>{children}</Provider>)
}

describe('GuideDrawer', () => {
  const store = mockStore({
    guides: {}
  })

  const remoteGuide: RemoteGuide = {
    currentSlide: 0,
    title: 'Title',
    identifier: 'identifier'
  }

  it('renders list view without Remote Guides', () => {
    const { container } = renderWithRedux(
      store,
      <GuideDrawer {...createProps(null, [])} />
    )

    expect(container).toMatchSnapshot()
  })

  it('renders list view including Remote Guides list', () => {
    const { container } = renderWithRedux(
      store,
      <GuideDrawer {...createProps(null, [remoteGuide])} />
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByTestId('remoteGuidesTitle')).not.toBeNull()
    expect(screen.getByText('Title')).not.toBeNull()
  })

  it('renders guide slide when a guide is selected', () => {
    // scrollIntoView is not implemented in jsdom
    // Avoid TypeError: scrollIntoView is not a function
    window.HTMLElement.prototype.scrollIntoView = () => undefined

    const { container } = renderWithRedux(
      store,
      <GuideDrawer
        {...createProps(
          { ...remoteGuide, slides: [<div key={1}>Test Slide</div>] },
          [remoteGuide]
        )}
      />
    )

    expect(container).toMatchSnapshot()
    expect(screen.getByText('Title')).not.toBeNull()
    expect(screen.getByText('Test Slide')).not.toBeNull()
  })
})
