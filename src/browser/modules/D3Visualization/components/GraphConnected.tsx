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
import { ConnectedComponent, connect } from 'react-redux'
import { Action, Dispatch } from 'redux'

import { Graph, GraphProps } from 'graph-visualization'

import { GlobalState } from 'project-root/src/shared/globalState'
import { shouldShowWheelZoomInfo } from 'project-root/src/shared/modules/settings/settingsDuck'
import * as actions from 'project-root/src/shared/modules/settings/settingsDuck'

const mapStateToProps = (state: GlobalState) => ({
  wheelZoomInfoMessageEnabled: shouldShowWheelZoomInfo(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  disableWheelZoomInfoMessage: () => {
    dispatch(actions.update({ showWheelZoomInfo: false }))
  }
})

export const GraphConnected: ConnectedComponent<
  typeof Graph,
  Omit<
    GraphProps,
    'wheelZoomInfoMessageEnabled' | 'disableWheelZoomInfoMessage'
  >
> = connect(mapStateToProps, mapDispatchToProps)(Graph)
