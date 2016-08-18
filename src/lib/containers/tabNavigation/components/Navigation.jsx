import React from 'react'
import { List, ListItem } from 'material-ui/List'
import IconButton from 'material-ui/IconButton'
import classNames from 'classnames'

class Navigation extends React.Component {
  render () {
    const buildNavList = (list) => {
      return list.map((item, index) => {
        const itemClass = classNames({
          [selectedItemClassName]: item.name.toLowerCase() === openDrawer
        })
        return (
          <ListItem key={index}
            className={itemClass}
            onTouchTap={() => onNavClick(item.name.toLowerCase())}>
            <IconButton tooltip={item.name}>
              {item.icon}
            </IconButton>
          </ListItem>
        )
      })
    }
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const topNavItemsList = this.props.topNavItems
    const bottomNavItemsList = this.props.bottomNavItems
    const selectedItemClassName = this.props.selectedItemClassName
    const getContentToShow = (openDrawer) => {
      if (openDrawer) {
        let filteredList = topNavItemsList.concat(bottomNavItemsList).filter((item) => {
          return item.name.toLowerCase() === openDrawer
        })
        let TabContent = filteredList[0].content
        return <TabContent/>
      }
      return null
    }
    const topNavItems = buildNavList(topNavItemsList)
    const bottomNavItems = buildNavList(bottomNavItemsList)
    const tabClass = classNames({
      hidden: !openDrawer,
      [this.props.tabClassName]: true
    })
    return (
      <div className={this.props.sidebarClassName}>
        <List className={this.props.listClassName}>
          <List className={this.props.listClassName}>{topNavItems}</List>
          <List className={this.props.listClassName}>{bottomNavItems}</List>
        </List>
        <div className={tabClass + ' tab'}>
          {getContentToShow(openDrawer)}
        </div>
      </div>
    )
  }
}

export default Navigation
