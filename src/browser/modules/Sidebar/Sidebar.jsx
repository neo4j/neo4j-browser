/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'preact'
import { connect } from 'preact-redux'
import DatabaseInfo from '../DatabaseInfo/DatabaseInfo'
import Favorites from './Favorites'
import Documents from './Documents'
import About from './About'
import TabNavigation from 'browser-components/TabNavigation/Navigation'
import Settings from './Settings'
import BrowserSync from './../Sync/BrowserSync'
import { isUserSignedIn } from 'shared/modules/sync/syncDuck'
import { useBrowserSync } from 'shared/modules/features/featuresDuck'
import {
  PENDING_STATE,
  CONNECTED_STATE,
  DISCONNECTED_STATE
} from 'shared/modules/connections/connectionsDuck'

import {
  DatabaseIcon,
  FavoritesIcon,
  DocumentsIcon,
  CloudSyncIcon,
  SettingsIcon,
  AboutIcon
} from 'browser-components/icons/Icons'

class Sidebar extends Component {
  render () {
    const openDrawer = this.props.openDrawer
    const onNavClick = this.props.onNavClick
    const DatabaseDrawer = DatabaseInfo
    const FavoritesDrawer = Favorites
    const DocumentsDrawer = Documents
    const SettingsDrawer = Settings
    const AboutDrawer = About
    const topNavItemsList = [
      {
        name: 'DB',
        title: 'Database',
        icon: isOpen => (
          <DatabaseIcon
            isOpen={isOpen}
            connectionState={this.props.neo4jConnectionState}
          />
        ),
        content: DatabaseDrawer
      },
      {
        name: 'Favorites',
        title: 'Favorites',
        icon: isOpen => <FavoritesIcon isOpen={isOpen} />,
        content: FavoritesDrawer
      },
      {
        name: 'Documents',
        title: 'Documentation',
        icon: isOpen => <DocumentsIcon isOpen={isOpen} />,
        content: DocumentsDrawer
      }
    ]
    const bottomNavItemsList = [
      {
        name: 'Sync',
        title: 'Cloud Services',
        icon: isOpen => (
          <CloudSyncIcon isOpen={isOpen} connected={this.props.syncConnected} />
        ),
        content: BrowserSync
      },
      {
        name: 'Settings',
        title: 'Browser Settings',
        icon: isOpen => <SettingsIcon isOpen={isOpen} />,
        content: SettingsDrawer
      },
      {
        name: 'About',
        title: 'About Neo4j',
        icon: isOpen => <AboutIcon isOpen={isOpen} />,
        content: AboutDrawer
      }
    ]

    return (
      <TabNavigation
        openDrawer={openDrawer}
        onNavClick={onNavClick}
        topNavItems={topNavItemsList}
        bottomNavItems={
          this.props.loadSync
            ? bottomNavItemsList
            : bottomNavItemsList.filter(item => item.name !== 'Sync')
        }
      />
    )
  }
}

const mapStateToProps = state => {
  let connectionState = 'disconnected'
  if (state.connections) {
    switch (state.connections.connectionState) {
      case PENDING_STATE:
        connectionState = 'pending'
        break
      case CONNECTED_STATE:
        connectionState = 'connected'
        break
      case DISCONNECTED_STATE:
        connectionState = 'disconnected'
        break
    }
  }
  return {
    syncConnected: isUserSignedIn(state) || false,
    neo4jConnectionState: connectionState,
    loadSync: useBrowserSync(state)
  }
}

export default connect(mapStateToProps, null)(Sidebar)
