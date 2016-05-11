import React from 'react'
import classNames from 'classnames'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const navItemsList = [
      {name: 'DB', icon: ''},
      {name: 'Fav', icon: ''}
    ]
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
        <div id='drawer' className={drawerClass}>{openDrawer}</div>
      </div>
    )
  }
}

export default Sidebar
