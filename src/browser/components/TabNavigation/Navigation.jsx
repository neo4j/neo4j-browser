import React from 'react'
import List from 'grommet/components/List'
import ListItem from 'grommet/components/ListItem'
import classNames from 'classnames'
import { NavigationButton } from 'nbnmui/buttons'

const Navigation = ({
  openDrawer,
  onNavClick,
  topNavItems,
  bottomNavItems = [],
  selectedItemClassName,
  tabClassName,
  sidebarClassName,
  listClassName
}) => {
  const buildNavList = (list) => {
    return list.map((item, index) => {
      const itemClass = classNames({
        [selectedItemClassName]: item.name.toLowerCase() === openDrawer
      })
      return (
        <ListItem key={index}
          className={itemClass}
          onClick={() => onNavClick(item.name.toLowerCase())}>
          <NavigationButton name={item.name}>{item.icon}</NavigationButton>
        </ListItem>
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
  const topNavItemsList = buildNavList(topNavItems)
  const bottomNavItemsList = buildNavList(bottomNavItems)
  const tabClass = classNames({
    hidden: !openDrawer,
    [tabClassName]: true
  })
  return (
    <div className={sidebarClassName}>
      <List className={listClassName}>
        <List className={listClassName}>{topNavItemsList}</List>
        <List className={listClassName}>{bottomNavItemsList}</List>
      </List>
      <div className={tabClass + ' tab'}>
        {getContentToShow(openDrawer)}
      </div>
    </div>
  )
}

export default Navigation
