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

import React, { Component } from 'react'
import {
  StyledNavigationButton,
  NavigationButtonContainer,
  StyledCannyBadgeAnchor
} from 'browser-components/buttons'
import { cannyOptions } from 'browser-services/canny'
import {
  StyledSidebar,
  StyledDrawer,
  StyledTabsWrapper,
  StyledTopNav,
  StyledBottomNav
} from './styled'
import { GUIDE_DRAWER_ID } from 'shared/modules/sidebar/sidebarDuck'

const Closing = 'CLOSING'
const Closed = 'CLOSED'
const Open = 'OPEN'
const Opening = 'OPENING'

export interface NavItem {
  name: string
  title: string
  icon: (isOpen: boolean) => JSX.Element
  content: any
  enableCannyBadge?: boolean
}

interface NavigationProps {
  openDrawer: string
  onNavClick: (name: string) => void
  topNavItems: NavItem[]
  bottomNavItems?: NavItem[]
}

type TransitionState =
  | typeof Closing
  | typeof Closed
  | typeof Open
  | typeof Opening

interface NavigationState {
  transitionState?: TransitionState
  drawerContent?: null | string
}

class Navigation extends Component<NavigationProps, NavigationState> {
  _onTransitionEnd: () => void
  transitionState?: TransitionState
  state: NavigationState = {}
  constructor(props: NavigationProps) {
    super(props)
    this._onTransitionEnd = this.onTransitionEnd.bind(this)
  }

  componentDidMount(): void {
    this.setState({
      transitionState: Closed
    })

    window.Canny && window.Canny('initChangelog', cannyOptions)
  }

  componentWillUnmount(): void {
    if (window.Canny) {
      window.Canny('closeChangelog')
    }
  }

  componentDidUpdate(
    prevProps: NavigationProps,
    prevState: NavigationState
  ): void {
    if (prevProps.openDrawer !== this.props.openDrawer) {
      const newState: NavigationState = {}
      if (this.props.openDrawer) {
        newState.drawerContent = this.props.openDrawer
        if (
          prevState.transitionState === Closed ||
          prevState.transitionState === Closing
        ) {
          newState.transitionState = Opening
        }
      } else {
        newState.drawerContent = ''
        if (
          prevState.transitionState === Open ||
          prevState.transitionState === Opening
        ) {
          newState.transitionState = Closing
        }
      }
      this.setState(newState)
    }
  }

  onTransitionEnd(): void {
    if (this.transitionState === Closing) {
      this.setState({
        transitionState: Closed,
        drawerContent: null
      })
    }
    if (this.transitionState === Opening) {
      this.setState({
        transitionState: Open
      })
    }
  }

  render(): JSX.Element {
    const { onNavClick, topNavItems, bottomNavItems = [] } = this.props

    const buildNavList = (list: NavItem[], selected?: null | string) =>
      list.map(item => {
        const isOpen = item.name.toLowerCase() === selected
        return (
          <div key={item.name}>
            {item.enableCannyBadge ? (
              <StyledCannyBadgeAnchor data-canny-changelog />
            ) : null}
            <NavigationButtonContainer
              title={item.title}
              data-testid={'drawer' + item.name}
              onClick={() => onNavClick(item.name.toLowerCase())}
              isOpen={isOpen}
            >
              <StyledNavigationButton name={item.name}>
                {item.icon(isOpen)}
              </StyledNavigationButton>
            </NavigationButtonContainer>
          </div>
        )
      })

    const getContentToShow = (openDrawer?: null | string) => {
      if (openDrawer) {
        const filteredList = topNavItems
          .concat(bottomNavItems)
          .filter(item => item.name.toLowerCase() === openDrawer)
        const TabContent = filteredList[0].content
        return <TabContent />
      }
      return null
    }
    const topNavItemsList = buildNavList(topNavItems, this.state.drawerContent)
    const bottomNavItemsList = buildNavList(
      bottomNavItems,
      this.state.drawerContent
    )

    const drawerWidth = this.props.openDrawer === GUIDE_DRAWER_ID ? 500 : 300
    const useFullWidth =
      this.state.transitionState === Open ||
      this.state.transitionState === Opening
    const width = useFullWidth ? drawerWidth : 0
    return (
      <StyledSidebar>
        <StyledTabsWrapper>
          <StyledTopNav>{topNavItemsList}</StyledTopNav>
          <StyledBottomNav>{bottomNavItemsList}</StyledBottomNav>
        </StyledTabsWrapper>
        <StyledDrawer
          width={width}
          ref={(ref: any) => {
            if (ref) {
              // Remove old listeners so we don't get multiple callbacks.
              // This function is called more than once with same html element
              ref.removeEventListener('transitionend', this._onTransitionEnd)
              ref.addEventListener('transitionend', this._onTransitionEnd)
            }
          }}
        >
          {getContentToShow(this.state.drawerContent)}
        </StyledDrawer>
      </StyledSidebar>
    )
  }
}

export default Navigation
