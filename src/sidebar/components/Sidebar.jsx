import React from 'react'
import dbInfo from '../dbInfo'
import tabNavigation from '../../tabNavigation'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = dbInfo.components.DatabaseInfo
    const Fav = () => {
      return <div>Fav</div>
    }
    const navItemsList = [
      {name: 'DB', icon: '', content: DatabaseDrawer},
      {name: 'Fav', icon: '', content: Fav}
    ]
    return <tabNavigation.components.Navigation openDrawer={openDrawer} onNavClick={onNavClick} navItems={navItemsList} styleId='sidebar'/>
  }
}

export default Sidebar
