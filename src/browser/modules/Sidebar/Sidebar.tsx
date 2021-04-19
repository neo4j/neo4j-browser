/*
 * Copyright (c) "Neo4j"
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
import DatabaseDrawer from '../DBMSInfo/DBMSInfo'
import DocumentsDrawer from './Documents'
import AboutDrawer from './About'
import SettingsDrawer from './Settings'
import GuidesDrawer from './GuidesDrawer'
import Favorites from './favorites'
import StaticScripts from './static-scripts'
import ProjectFilesDrawer from './ProjectFiles'
import TabNavigation, {
  NavItem,
  STANDARD_DRAWER_WIDTH
} from 'browser-components/TabNavigation/Navigation'
import BrowserSync from '../Sync/BrowserSync'
import { GlobalState } from 'shared/globalState'
import { isUserSignedIn } from 'shared/modules/sync/syncDuck'
import { utilizeBrowserSync } from 'shared/modules/features/featuresDuck'
import {
  PENDING_STATE,
  CONNECTED_STATE,
  DISCONNECTED_STATE
} from 'shared/modules/connections/connectionsDuck'
import { isRelateAvailable } from 'shared/modules/app/appDuck'

import {
  DatabaseIcon,
  FavoritesIcon,
  DocumentsIcon,
  CloudSyncIcon,
  SettingsIcon,
  AboutIcon,
  ProjectFilesIcon,
  GuidesDrawerIcon
} from 'browser-components/icons/Icons'
import { getCurrentDraft } from 'shared/modules/sidebar/sidebarDuck'
import { DrawerHeader } from 'browser-components/drawer/drawer'

interface SidebarProps {
  openDrawer: string
  onNavClick: () => void
  neo4jConnectionState: string
  showStaticScripts: boolean
  syncConnected: boolean
  loadSync: boolean
  isRelateAvailable: boolean
  scriptDraft: string | null
}

const Sidebar = ({
  openDrawer,
  onNavClick,
  neo4jConnectionState,
  showStaticScripts,
  syncConnected,
  loadSync,
  isRelateAvailable,
  scriptDraft
}: SidebarProps) => {
  const topNavItemsList: NavItem[] = [
    {
      name: 'DBMS',
      title: 'Database Information',
      icon: function dbIcon(isOpen: boolean): JSX.Element {
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
      icon: function favIcon(isOpen: boolean): JSX.Element {
        return <FavoritesIcon isOpen={isOpen} title="Favorites" />
      },
      content: function FavoritesDrawer(): JSX.Element {
        return (
          <div style={{ width: STANDARD_DRAWER_WIDTH }}>
            <DrawerHeader> Favorites </DrawerHeader>
            <Favorites />
            {showStaticScripts && <StaticScripts />}
          </div>
        )
      }
    },
    ...(isRelateAvailable
      ? [
          {
            name: 'Project Files',
            title: 'Project Files',
            icon: function projectFilesIcon(isOpen: boolean): JSX.Element {
              return <ProjectFilesIcon isOpen={isOpen} title="Project Files" />
            },
            content: function ProjectDrawer(): JSX.Element {
              return <ProjectFilesDrawer scriptDraft={scriptDraft || ''} />
            }
          }
        ]
      : []),
    {
      name: 'Guides',
      title: 'Guides',
      icon: function guidesDrawerIcon(isOpen: boolean): JSX.Element {
        return <GuidesDrawerIcon isOpen={isOpen} />
      },
      content: GuidesDrawer
    }
  ]

  const bottomNavItemsList: NavItem[] = [
    {
      name: 'Documents',
      title: 'Help &amp; Resources',
      icon: function docsIcon(isOpen: boolean): JSX.Element {
        return <DocumentsIcon isOpen={isOpen} title="Help &amp; Resources" />
      },
      content: DocumentsDrawer,
      enableCannyBadge: true
    },
    {
      name: 'Sync',
      title: 'Browser Sync',
      icon: function syncIcon(isOpen: boolean): JSX.Element {
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
      icon: function settingIcon(isOpen: boolean): JSX.Element {
        return <SettingsIcon isOpen={isOpen} title="Browser Settings" />
      },
      content: SettingsDrawer
    },
    {
      name: 'About',
      title: 'About Neo4j',
      icon: function aboutIcon(isOpen: boolean): JSX.Element {
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

const mapStateToProps = (state: GlobalState) => {
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
    loadSync: utilizeBrowserSync(state),
    showStaticScripts: state.settings.showSampleScripts,
    isRelateAvailable: isRelateAvailable(state),
    scriptDraft: getCurrentDraft(state)
  }
}

export default connect(mapStateToProps)(Sidebar)
