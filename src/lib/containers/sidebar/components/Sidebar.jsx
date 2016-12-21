import React from 'react'
import dbInfo from 'containers/dbInfo'
import favorites from '../favorites'
import documents from '../documents'
import tabNavigation from 'containers/tabNavigation'
import settings from 'containers/settings'
import MdGrade from 'react-icons/lib/md/grade'
import MdViewHeadline from 'react-icons/lib/md/view-headline'
import MdDescription from 'react-icons/lib/md/description'
import MdSettingsApplications from 'react-icons/lib/md/settings-applications'
import MdCloud from 'react-icons/lib/md/cloud'
import MdInfo from 'react-icons/lib/md/info'

import styles from './style.css'

class Sidebar extends React.Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = dbInfo.components.DatabaseInfo
    const FavoritesDrawer = favorites.components.Favorites
    const DocumentsDrawer = documents.components.DocumentsComponent
    const SettingsDrawer = settings.components.Settings
    const topNavItemsList = [
      {name: 'DB', icon: <MdViewHeadline />, content: DatabaseDrawer},
      {name: 'Favorites', icon: <MdGrade />, content: FavoritesDrawer},
      {name: 'Documents', icon: <MdDescription />, content: DocumentsDrawer}
    ]
    const bottomNavItemsList = [
      {name: 'Sync', icon: <MdCloud />, content: SettingsDrawer},
      {name: 'Settings', icon: <MdSettingsApplications />, content: SettingsDrawer},
      {name: 'About', icon: <MdInfo />, content: SettingsDrawer}
    ]

    return (<tabNavigation.components.Navigation
      openDrawer={openDrawer}
      onNavClick={onNavClick}
      topNavItems={topNavItemsList}
      bottomNavItems={bottomNavItemsList}
      sidebarClassName={styles.sidebar}
      listClassName={styles.list}
      selectedItemClassName={styles['selected-item']}
      tabClassName={styles.tab}
    />)
  }
}

export default Sidebar
