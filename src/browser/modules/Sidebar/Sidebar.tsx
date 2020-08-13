/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import React, { ReactFragment, ReactElement } from 'react'
import { connect } from 'react-redux'
import DatabaseDrawer from '../DBMSInfo/DBMSInfo'
import DocumentsDrawer from './Documents'
import AboutDrawer from './About'
import SettingsDrawer from './Settings'
import Favorites from './favorites'
import StaticScripts from './static-scripts'
import TabNavigation from 'browser-components/TabNavigation/Navigation'
import { DrawerHeader } from 'browser-components/drawer'
import BrowserSync from '../Sync/BrowserSync'
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

interface SidebarProps {
  openDrawer: string
  onNavClick: () => void
  showStaticScripts: boolean
  neo4jConnectionState: string
  syncConnected: boolean
  loadSync: boolean
}

const Sidebar = ({
  openDrawer,
  onNavClick,
  showStaticScripts,
  neo4jConnectionState,
  syncConnected,
  loadSync
}: SidebarProps) => {
  const topNavItemsList = [
    {
      name: 'DBMS',
      title: 'Database Information',
      icon: function dbIcon(isOpen: boolean): ReactElement {
        return (
          <DatabaseIcon
            isOpen={isOpen}
            connectionState={neo4jConnectionState}
            title="Database"
          />
        )
      },
      content: DatabaseDrawer
    },
    {
      name: 'Favorites',
      title: 'Favorites',
      icon: function favIcon(isOpen: boolean): ReactElement {
        return <FavoritesIcon isOpen={isOpen} title="Favorites" />
      },
      content: function FavoritesDrawer(): ReactFragment {
        return (
          <>
            <DrawerHeader>Favorites</DrawerHeader>
            <Favorites />
            {showStaticScripts && <StaticScripts />}
          </>
        )
      }
    },
    {
      name: 'Documents',
      title: 'Help &amp; Resources',
      icon: function docsIcon(isOpen: boolean): ReactElement {
        return <DocumentsIcon isOpen={isOpen} title="Help &amp; Resources" />
      },
      content: DocumentsDrawer
    }
  ]

  const bottomNavItemsList = [
    {
      name: 'Sync',
      title: 'Browser Sync',
      icon: function syncIcon(isOpen: boolean): ReactElement {
        return (
          <CloudSyncIcon
            isOpen={isOpen}
            connected={syncConnected}
            title="Browser Sync"
          />
        )
      },
      content: BrowserSync
    },
    {
      name: 'Settings',
      title: 'Settings',
      icon: function settingIcon(isOpen: boolean): ReactElement {
        return <SettingsIcon isOpen={isOpen} title="Browser Settings" />
      },
      content: SettingsDrawer
    },
    {
      name: 'About',
      title: 'About Neo4j',
      icon: function aboutIcon(isOpen: boolean): ReactElement {
        return <AboutIcon isOpen={isOpen} title="About Neo4j" />
      },
      content: AboutDrawer
    }
  ].filter(({ name }) => loadSync || name !== 'Sync')

  return (
    <TabNavigation
      openDrawer={openDrawer}
      onNavClick={onNavClick}
      topNavItems={topNavItemsList}
      bottomNavItems={bottomNavItemsList}
    />
  )
}

const mapStateToProps = (state: any) => {
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
    loadSync: useBrowserSync(state),
    showStaticScripts: state.settings.showSampleScripts
  }
}

export default connect(mapStateToProps, null)(Sidebar)
