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

import React, { Component } from 'react'
import {
  StyledNavigationButton,
  NavigationButtonContainer
} from 'browser-components/buttons'
import {
  StyledSidebar,
  StyledDrawer,
  StyledTabsWrapper,
  StyledTopNav,
  StyledBottomNav
} from './styled'

const Closing = 'CLOSING'
const Closed = 'CLOSED'
const Open = 'OPEN'
const Opening = 'OPENING'

class Navigation extends Component {
  state = {}
  constructor (props) {
    super(props)
    this._onTransitionEnd = this.onTransitionEnd.bind(this)
  }
  componentDidMount () {
    this.setState({
      transitionState: Closed
    })
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.openDrawer !== this.props.openDrawer) {
      var newState = {}
      if (nextProps.openDrawer) {
        newState.drawerContent = nextProps.openDrawer
        if (
          this.state.transitionState === Closed ||
          this.state.transitionState === Closing
        ) {
          newState.transitionState = Opening
        }
      } else {
        newState.drawerContent = ''
        if (
          this.state.transitionState === Open ||
          this.state.transitionState === Opening
        ) {
          newState.transitionState = Closing
        }
      }
      this.setState(newState)
    }
  }

  onTransitionEnd () {
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

  render () {
    let { onNavClick, topNavItems, bottomNavItems = [] } = this.props

    const buildNavList = (list, selected) => {
      return list.map((item, index) => {
        const isOpen = item.name.toLowerCase() === selected
        return (
          <NavigationButtonContainer
            title={item.title}
            data-test-id={'drawer' + item.name}
            key={index}
            onClick={() => onNavClick(item.name.toLowerCase())}
            isOpen={isOpen}
          >
            <StyledNavigationButton name={item.name}>
              {item.icon(isOpen)}
            </StyledNavigationButton>
          </NavigationButtonContainer>
        )
      })
    }
    const getContentToShow = openDrawer => {
      if (openDrawer) {
        let filteredList = topNavItems.concat(bottomNavItems).filter(item => {
          return item.name.toLowerCase() === openDrawer
        })
        let TabContent = filteredList[0].content
        return <TabContent />
      }
      return null
    }
    const topNavItemsList = buildNavList(topNavItems, this.state.drawerContent)
    const bottomNavItemsList = buildNavList(
      bottomNavItems,
      this.state.drawerContent
    )

    return (
      <StyledSidebar>
        <StyledTabsWrapper>
          <StyledTopNav>{topNavItemsList}</StyledTopNav>
          <StyledBottomNav>{bottomNavItemsList}</StyledBottomNav>
        </StyledTabsWrapper>
        <StyledDrawer
          open={
            this.state.transitionState === Open ||
            this.state.transitionState === Opening
          }
          innerRef={ref => {
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
