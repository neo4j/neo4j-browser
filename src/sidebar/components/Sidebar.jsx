import React from 'react'
import classNames from 'classnames'
import dbInfo from '../../dbInfo'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const navItemsList = [
      {name: 'DB', icon: ''},
      {name: 'Fav', icon: ''}
    ]
    const drawerContentMap = (openDrawer) => {
      if (openDrawer === 'db') {
        return <dbInfo.components.DatabaseDrawer/>
      }
      return openDrawer
    }
    const navItems = navItemsList.map((item, index) => {
      const itemClass = classNames({
        open: item.name.toLowerCase() === openDrawer
      })
      return <li
        onClick={() => onNavClick(item.name.toLowerCase())}
        key={index}
        className={itemClass}
        >{item.name}</li>
    })
    const drawerClass = classNames({
      hidden: !openDrawer
    })
    return (
      <div id='sidebar'>
        <div id='nav'>
          <ul>{navItems}</ul>
        </div>
        <div id='drawer' className={drawerClass}>
          {drawerContentMap(openDrawer)}
        </div>
      </div>
    )
  }
}

export default Sidebar
