import React from 'react'
import dbInfo from '../dbInfo'
import favorites from '../favorites'
import tabNavigation from '../../tabNavigation'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = dbInfo.components.DatabaseInfo
    const FavoritesDrawer = favorites.components.Favorites
    const navItemsList = [
      {name: 'DB', icon: '', content: DatabaseDrawer},
      {name: 'Favorites', icon: '', content: FavoritesDrawer}
    ]

    return <tabNavigation.components.Navigation openDrawer={openDrawer} onNavClick={onNavClick} navItems={navItemsList} styleId='sidebar'/>
  }
}

export default Sidebar
