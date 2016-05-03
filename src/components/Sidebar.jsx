import React from 'react'
import classNames from 'classnames'

export default class Sidebar extends React.Component {
  render () {
    const openedDrawer = this.props.openedDrawer
    const navItemsList = [
      {name: 'DB', icon: ''},
      {name: 'Fav', icon: ''}
    ]
    const navItems = navItemsList.map((item, index) => {
      const itemClass = classNames({
        open: item.name.toLowerCase() === openedDrawer
      })
      return <li key={index} className={itemClass}>{item.name}</li>
    })
    return (
      <div id='sidebar'>
        <div id='nav'>
          <ul>{navItems}</ul>
        </div>
        <div id='drawer'></div>
      </div>
    )
  }
}
