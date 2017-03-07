import { Component } from 'preact'
import DatabaseInfo from '../DatabaseInfo/DatabaseInfo'
import Favorites from './Favorites'
import Documents from './Documents'
import About from './About'
import TabNavigation from 'browser-components/TabNavigation/Navigation'
import Settings from './Settings'
import Sync from './Sync'
import {
  DatabaseIcon,
  FavoritesIcon,
  DocumentsIcon,
  CloudIcon,
  SettingsIcon,
  AboutIcon
} from 'nbnmui/icons/Icons'

import MdFlashOn from 'react-icons/lib/md/flash-on'
import MdFlashOff from 'react-icons/lib/md/flash-off'
import Badge from 'browser-components/badge'

import styles from './style.css'

class Sidebar extends Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = DatabaseInfo
    const FavoritesDrawer = Favorites
    const DocumentsDrawer = Documents
    const SettingsDrawer = Settings
    const AboutDrawer = About
    const dbIcon = (
      <div style={{position: 'relative'}}>
        <DatabaseIcon />
        { this.props.activeConnection
          ? <Badge status='ok'><MdFlashOn /></Badge>
          : <Badge status='error'><MdFlashOff /></Badge>
        }
      </div>
    )
    const topNavItemsList = [
      {name: 'DB', icon: dbIcon, content: DatabaseDrawer},
      {name: 'Favorites', icon: <FavoritesIcon />, content: FavoritesDrawer},
      {name: 'Documents', icon: <DocumentsIcon />, content: DocumentsDrawer}
    ]
    const bottomNavItemsList = [
      {name: 'Sync', icon: <CloudIcon />, content: Sync},
      {name: 'Settings', icon: <SettingsIcon />, content: SettingsDrawer},
      {name: 'About', icon: <AboutIcon />, content: AboutDrawer}
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
