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

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import {
  commandSources,
  executeCommand,
  useDbCommand
} from 'shared/modules/commands/commandsDuck'
import { getCurrentUser } from 'shared/modules/currentUser/currentUserDuck'
import { getGraphStyleData } from 'shared/modules/grass/grassDuck'
import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'
import { UserDetails } from './UserDetails'
import DatabaseKernelInfo from './DatabaseKernelInfo'
import {
  Drawer,
  DrawerBody,
  DrawerHeader
} from 'browser-components/drawer/drawer-styled'
import { DatabaseSelector } from './DatabaseSelector'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import { getDatabases } from 'shared/modules/dbMeta/dbMetaDuck'

export function DBMSInfo(props: any): JSX.Element {
  const moreStep = 50
  const [labelsMax, setLabelsMax] = useState(moreStep)
  const [relationshipsMax, setRelationshipsMax] = useState(moreStep)
  const [propertiesMax, setPropertiesMax] = useState(moreStep)

  function onMoreClick(type: any, currentMax: any) {
    const map: any = {
      labels: setLabelsMax,
      relationships: setRelationshipsMax,
      properties: setPropertiesMax
    }
    return (num: any) => map[type](currentMax + num)
  }

  const {
    labels = [],
    relationshipTypes = [],
    properties = [],
    databaseKernelInfo,
    nodes,
    relationships
  } = props.meta
  const { user, onItemClick, onDbSelect, useDb = '', databases = [] } = props

  return (
    <Drawer id="db-drawer">
      <DrawerHeader>Database Information</DrawerHeader>
      <DrawerBody>
        <DatabaseSelector
          databases={databases}
          selectedDb={useDb}
          onChange={onDbSelect}
        />
        <LabelItems
          count={nodes}
          labels={labels.slice(0, labelsMax).map((l: any) => l.val)}
          totalNumItems={labels.length}
          onItemClick={onItemClick}
          onMoreClick={onMoreClick('labels', labelsMax)}
          moreStep={moreStep}
          graphStyleData={props.graphStyleData}
        />
        <RelationshipItems
          count={relationships}
          relationshipTypes={relationshipTypes
            .slice(0, relationshipsMax)
            .map((l: any) => l.val)}
          onItemClick={onItemClick}
          totalNumItems={relationshipTypes.length}
          onMoreClick={onMoreClick('relationships', relationshipsMax)}
          moreStep={moreStep}
          graphStyleData={props.graphStyleData}
        />
        <PropertyItems
          properties={properties.slice(0, propertiesMax).map((l: any) => l.val)}
          onItemClick={onItemClick}
          totalNumItems={properties.length}
          onMoreClick={onMoreClick('properties', propertiesMax)}
          moreStep={moreStep}
        />
        <UserDetails user={user} onItemClick={onItemClick} />
        <DatabaseKernelInfo
          databaseKernelInfo={databaseKernelInfo}
          onItemClick={onItemClick}
        />
      </DrawerBody>
    </Drawer>
  )
}

const mapStateToProps = (state: any) => {
  const useDb = getUseDb(state)
  const databases = getDatabases(state)
  return {
    graphStyleData: getGraphStyleData(state),
    meta: state.meta,
    user: getCurrentUser(state),
    useDb,
    databases
  }
}
const mapDispatchToProps = (dispatch: any, ownProps: any) => {
  return {
    onItemClick: (cmd: any) => {
      const action = executeCommand(cmd, { source: commandSources.button })
      ownProps.bus.send(action.type, action)
    },
    onDbSelect: (dbName: any) =>
      dispatch(executeCommand(`:${useDbCommand} ${dbName || ''}`), {
        source: commandSources.button
      })
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(DBMSInfo))
