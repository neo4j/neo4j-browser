import React from 'react'
import dbInfo from '../dbInfo'
import favorites from '../favorites'
import documents from '../documents'
import tabNavigation from '../../tabNavigation'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = dbInfo.components.DatabaseInfo
    const FavoritesDrawer = favorites.components.Favorites
    const DocumentsDrawer = documents.components.DocumentsComponent
    const navItemsList = [
      {name: 'DB', icon: '', content: DatabaseDrawer},
      {name: 'Favorites', icon: '', content: FavoritesDrawer},
      {name: 'Documents', icon: '', content: DocumentsDrawer}
    ]

    return <tabNavigation.components.Navigation openDrawer={openDrawer} onNavClick={onNavClick} navItems={navItemsList} styleId='sidebar'/>
  }
}

export default Sidebar
