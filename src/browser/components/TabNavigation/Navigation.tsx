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

import React, { Component, TransitionEvent } from 'react'
import {
  StyledNavigationButton,
  NavigationButtonContainer,
  StyledCannyBadgeAnchor
} from 'browser-components/buttons'
import {
  StyledSidebar,
  StyledDrawer,
  StyledTabsWrapper,
  StyledTopNav,
  StyledBottomNav
} from './styled'
import { GUIDE_DRAWER_ID } from 'shared/modules/sidebar/sidebarDuck'

export const LARGE_DRAWER_WIDTH = 500
export const STANDARD_DRAWER_WIDTH = 300

const Closing = 'CLOSING'
const Closed = 'CLOSED'
const Open = 'OPEN'
const Opening = 'OPENING'
type DrawerTransitionState =
  | typeof Closing
  | typeof Closed
  | typeof Open
  | typeof Opening

export interface NavItem {
  name: string
  title: string
  icon: (isOpen: boolean) => JSX.Element
  content: any
  enableCannyBadge?: boolean
}

interface NavigationProps {
  selectedDrawerName: string | null
  onNavClick: (name: string) => void
  topNavItems: NavItem[]
  bottomNavItems?: NavItem[]
}

interface NavigationState {
  transitionState: DrawerTransitionState
  closingDrawerName: string | null
}

class Navigation extends Component<NavigationProps, NavigationState> {
  state: NavigationState = {
    transitionState: this.props.selectedDrawerName ? Open : Closed,
    closingDrawerName: null
  }

  componentDidUpdate(
    prevProps: NavigationProps,
    prevState: NavigationState
  ): void {
    let closingDrawerName: string | null = null
    let newTransitionState: DrawerTransitionState = prevState.transitionState
    if (prevProps.selectedDrawerName !== this.props.selectedDrawerName) {
      if (this.props.selectedDrawerName) {
        if (
          prevState.transitionState === Closed ||
          prevState.transitionState === Closing
        ) {
          newTransitionState = Opening
          closingDrawerName = null
        }
      } else {
        if (
          prevState.transitionState === Open ||
          prevState.transitionState === Opening
        ) {
          newTransitionState = Closing
          closingDrawerName = prevProps.selectedDrawerName
        }
      }
      this.setState({
        transitionState: newTransitionState,
        closingDrawerName: closingDrawerName
      })
    }
  }

  onTransitionEnd = (event: TransitionEvent<HTMLDivElement>): void => {
    if (event.propertyName !== 'width') {
      return
    }

    if (this.state.transitionState === Closing) {
      this.setState({
        transitionState: Closed
      })
    }
    if (this.state.transitionState === Opening) {
      this.setState({
        transitionState: Open
      })
    }
  }

  render(): JSX.Element {
    const { onNavClick, topNavItems, bottomNavItems = [] } = this.props

    const buildNavList = (
      list: NavItem[],
      selectedDrawerName?: null | string
    ) =>
      list.map(item => {
        const isOpen = item.name.toLowerCase() === selectedDrawerName
        return (
          <div key={item.name}>
            {item.enableCannyBadge ? (
              <StyledCannyBadgeAnchor
                data-testid={`navigationCanny${item.name}`}
                data-canny-changelog
              />
            ) : null}
            <NavigationButtonContainer
              title={item.title}
              data-testid={`navigation${item.name}`}
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

    const getContentToShow = (selectedDrawerName?: null | string) => {
      if (selectedDrawerName) {
        const filteredList = topNavItems
          .concat(bottomNavItems)
          .filter(item => item.name.toLowerCase() === selectedDrawerName)
        const TabContent = filteredList[0].content
        return <TabContent />
      }
      return null
    }
    const topNavItemsList = buildNavList(
      topNavItems,
      this.props.selectedDrawerName
    )
    const bottomNavItemsList = buildNavList(
      bottomNavItems,
      this.props.selectedDrawerName
    )

    const drawerIsVisible = this.state.transitionState !== Closed

    const drawerWidth =
      this.props.selectedDrawerName === GUIDE_DRAWER_ID
        ? LARGE_DRAWER_WIDTH
        : STANDARD_DRAWER_WIDTH
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
        <StyledDrawer width={width} onTransitionEnd={this.onTransitionEnd}>
          {drawerIsVisible &&
            getContentToShow(
              this.props.selectedDrawerName || this.state.closingDrawerName
            )}
        </StyledDrawer>
      </StyledSidebar>
    )
  }
}

export default Navigation
