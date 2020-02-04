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

import React from 'react'
import { connect } from 'react-redux'
import DBMSInfo from '../DBMSInfo/DBMSInfo'
import Documents from './Documents'
import About from './About'
import Favorites from './favorites'
import StaticScripts from './static-scripts'
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

function Sidebar(props) {
  const openDrawer = props.openDrawer
  const onNavClick = props.onNavClick
  const { showStaticScripts } = props
  const DatabaseDrawer = DBMSInfo
  const FavoritesDrawer = () => (
    <>
      <Favorites />
      {showStaticScripts && <StaticScripts />}
    </>
  )
  const DocumentsDrawer = Documents
  const SettingsDrawer = Settings
  const AboutDrawer = About
  const topNavItemsList = [
    {
      name: 'DBMS',
      title: 'Database',
      icon: function dbIcon(isOpen) {
        return (
          <DatabaseIcon
            isOpen={isOpen}
            connectionState={props.neo4jConnectionState}
            title="Database"
          />
        )
      },
      content: DatabaseDrawer
    },
    {
      name: 'Favorites',
      title: 'Favorites',
      icon: function favIcon(isOpen) {
        return <FavoritesIcon isOpen={isOpen} title="Favorites" />
      },
      content: FavoritesDrawer
    },
    {
      name: 'Documents',
      title: 'Documentation',
      icon: function docsIcon(isOpen) {
        return <DocumentsIcon isOpen={isOpen} title="Documentation" />
      },
      content: DocumentsDrawer
    }
  ]
  const bottomNavItemsList = [
    {
      name: 'Sync',
      title: 'Cloud Services',
      icon: function syncIcon(isOpen) {
        return (
          <CloudSyncIcon
            isOpen={isOpen}
            connected={props.syncConnected}
            title="Cloud Services"
          />
        )
      },
      content: BrowserSync
    },
    {
      name: 'Settings',
      title: 'Browser Settings',
      icon: function settingIcon(isOpen) {
        return <SettingsIcon isOpen={isOpen} title="Browser Settings" />
      },
      content: SettingsDrawer
    },
    {
      name: 'About',
      title: 'About Neo4j',
      icon: function aboutIcon(isOpen) {
        return <AboutIcon isOpen={isOpen} title="About Neo4j" />
      },
      content: AboutDrawer
    }
  ]

  return (
    <TabNavigation
      openDrawer={openDrawer}
      onNavClick={onNavClick}
      topNavItems={topNavItemsList}
      bottomNavItems={
        props.loadSync
          ? bottomNavItemsList
          : bottomNavItemsList.filter(item => item.name !== 'Sync')
      }
    />
  )
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
    loadSync: useBrowserSync(state),
    showStaticScripts: state.settings.showSampleScripts
  }
}

export default connect(
  mapStateToProps,
  null
)(Sidebar)
