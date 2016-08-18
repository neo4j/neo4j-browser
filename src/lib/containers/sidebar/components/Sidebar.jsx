import React from 'react'
import dbInfo from '../../dbInfo'
import favorites from '../favorites'
import documents from '../documents'
import tabNavigation from '../../tabNavigation'
import settings from '../../settings'
import ActionGrade from 'material-ui/svg-icons/action/grade'
import ActionViewHeadline from 'material-ui/svg-icons/action/view-headline'
import ActionDescription from 'material-ui/svg-icons/action/description'
import ActionSettings from 'material-ui/svg-icons/action/settings'
import FileCloud from 'material-ui/svg-icons/file/cloud'
import ActionInfo from 'material-ui/svg-icons/action/info'

import {white} from 'material-ui/styles/colors'

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
      {name: 'DB', icon: <ActionViewHeadline color={white}/>, content: DatabaseDrawer},
      {name: 'Favorites', icon: <ActionGrade color={white}/>, content: FavoritesDrawer},
      {name: 'Documents', icon: <ActionDescription color={white}/>, content: DocumentsDrawer}
    ]
    const bottomNavItemsList = [
      {name: 'Sync', icon: <FileCloud color={white}/>, content: SettingsDrawer},
      {name: 'Settings', icon: <ActionSettings color={white}/>, content: SettingsDrawer},
      {name: 'About', icon: <ActionInfo color={white}/>, content: SettingsDrawer}
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
