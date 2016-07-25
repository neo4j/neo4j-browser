import React from 'react'
import { List, ListItem } from 'material-ui/List'
import classNames from 'classnames'

class Navigation extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const navItemsList = this.props.navItems
    const selectedItemClassName = this.props.selectedItemClassName
    const getContentToShow = (openDrawer) => {
      if (openDrawer) {
        let filteredList = navItemsList.filter((item) => {
          return item.name.toLowerCase() === openDrawer
        })
        let TabContent = filteredList[0].content
        return <TabContent/>
      }
      return null
    }
    const navItems = navItemsList.map((item, index) => {
      const itemClass = classNames({
        [selectedItemClassName]: item.name.toLowerCase() === openDrawer
      })
      return <ListItem
        onTouchTap={() => onNavClick(item.name.toLowerCase())}
        key={index}
        className={itemClass}
        primaryText={item.name}
      />
    })
    const tabClass = classNames({
      hidden: !openDrawer,
      [this.props.tabClassName]: true
    })
    return (
      <div className={this.props.sidebarClassName}>
        <List className={this.props.listClassName}>{navItems}</List>
        <div className={tabClass}>
          {getContentToShow(openDrawer)}
        </div>
      </div>
    )
  }
}

export default Navigation
