/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { StyledNavigationButton, NavigationButtonContainer } from 'browser-components/buttons'
import { StyledSidebar, StyledDrawer, HiddenDrawer, StyledTabsWrapper, StyledTopNav, StyledBottomNav } from './styled'
const Navigation = ({
  openDrawer,
  onNavClick,
  topNavItems,
  bottomNavItems = [],
  sidebarClassName
}) => {
  const buildNavList = (list, selected) => {
    return list.map((item, index) => {
      const isOpen = item.name.toLowerCase() === selected
      return (
        <NavigationButtonContainer
          key={index}
          onClick={() => onNavClick(item.name.toLowerCase())}
          isOpen={isOpen}
        >
          <StyledNavigationButton name={item.name}>{item.icon(isOpen)}</StyledNavigationButton>
        </NavigationButtonContainer>
      )
    })
  }
  const getContentToShow = (openDrawer) => {
    if (openDrawer) {
      let filteredList = topNavItems.concat(bottomNavItems).filter((item) => {
        return item.name.toLowerCase() === openDrawer
      })
      let TabContent = filteredList[0].content
      return <TabContent />
    }
    return null
  }
  const topNavItemsList = buildNavList(topNavItems, openDrawer)
  const bottomNavItemsList = buildNavList(bottomNavItems, openDrawer)
  const DrawerComponent = openDrawer ? StyledDrawer : HiddenDrawer
  return (
    <StyledSidebar>
      <StyledTabsWrapper>
        <StyledTopNav>{topNavItemsList}</StyledTopNav>
        <StyledBottomNav>{bottomNavItemsList}</StyledBottomNav>
      </StyledTabsWrapper>
      <DrawerComponent>
        {getContentToShow(openDrawer)}
      </DrawerComponent>
    </StyledSidebar>
  )
}

export default Navigation
