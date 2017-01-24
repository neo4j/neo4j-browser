import React from 'react'
import DatabaseInfo from '../DatabaseInfo/DatabaseInfo'
import Favorites from './Favorites'
import Documents from './Documents'
import About from './About'
import TabNavigation from '../../components/TabNavigation/Navigation'
import Settings from './Settings'
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
    const DatabaseDrawer = DatabaseInfo
    const FavoritesDrawer = Favorites
    const DocumentsDrawer = Documents
    const SettingsDrawer = Settings
    const AboutDrawer = About
    const topNavItemsList = [
      {name: 'DB', icon: <MdViewHeadline type='control' />, content: DatabaseDrawer},
      {name: 'Favorites', icon: <MdGrade type='control' />, content: FavoritesDrawer},
      {name: 'Documents', icon: <MdDescription type='control' />, content: DocumentsDrawer}
    ]
    const bottomNavItemsList = [
      {name: 'Sync', icon: <MdCloud type='control' />, content: SettingsDrawer},
      {name: 'Settings', icon: <MdSettingsApplications type='control' />, content: SettingsDrawer},
      {name: 'About', icon: <MdInfo type='control' />, content: AboutDrawer}
    ]

    return (<TabNavigation
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
