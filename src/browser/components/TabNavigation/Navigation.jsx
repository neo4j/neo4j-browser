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
