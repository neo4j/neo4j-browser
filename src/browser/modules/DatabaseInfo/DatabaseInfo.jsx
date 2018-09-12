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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { getCurrentUser } from 'shared/modules/currentUser/currentUserDuck'
import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'
import { UserDetails } from './UserDetails'
import DatabaseKernelInfo from './DatabaseKernelInfo'
import { Drawer, DrawerBody, DrawerHeader } from 'browser-components/drawer'

export class DatabaseInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      moreStep: 50,
      labelsMax: 50,
      relationshipsMax: 50,
      propertiesMax: 50
    }
  }
  onMoreClick (type) {
    return num => {
      this.setState({ [type + 'Max']: this.state[type + 'Max'] + num })
    }
  }
  render () {
    const {
      labels = [],
      relationshipTypes = [],
      properties = [],
      databaseKernelInfo,
      nodes,
      relationships
    } = this.props.meta
    const { user, onItemClick } = this.props

    return (
      <Drawer id='db-drawer'>
        <DrawerHeader>Database Information</DrawerHeader>
        <DrawerBody>
          <LabelItems
            count={nodes}
            labels={labels.slice(0, this.state.labelsMax).map(l => l.val)}
            totalNumItems={labels.length}
            onItemClick={onItemClick}
            onMoreClick={this.onMoreClick.bind(this)('labels')}
            moreStep={this.state.moreStep}
          />
          <RelationshipItems
            count={relationships}
            relationshipTypes={relationshipTypes
              .slice(0, this.state.relationshipsMax)
              .map(l => l.val)}
            onItemClick={onItemClick}
            totalNumItems={relationshipTypes.length}
            onMoreClick={this.onMoreClick.bind(this)('relationships')}
            moreStep={this.state.moreStep}
          />
          <PropertyItems
            properties={properties
              .slice(0, this.state.propertiesMax)
              .map(l => l.val)}
            onItemClick={onItemClick}
            totalNumItems={properties.length}
            onMoreClick={this.onMoreClick.bind(this)('properties')}
            moreStep={this.state.moreStep}
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
}

const mapStateToProps = state => {
  return { meta: state.meta, user: getCurrentUser(state) }
}
const mapDispatchToProps = (_, ownProps) => {
  return {
    onItemClick: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(DatabaseInfo)
)
