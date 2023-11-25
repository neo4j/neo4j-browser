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

export { NodeModel } from './models/Node'
export { GraphModel } from './models/Graph'
export { GraphStyleModel, Selector } from './models/GraphStyle'

export type { NodeItem, RelationshipItem, VizItem } from './types'

export type {
  GraphStats,
  GraphStatsLabels,
  GraphStatsRelationshipTypes
} from './utils/mapper'
export { measureText } from './utils/textMeasurement'

export { GraphVisualizer } from './GraphVisualizer/GraphVisualizer'
export type { DetailsPaneProps } from './GraphVisualizer/DefaultPanelContent/DefaultDetailsPane'
export type { OverviewPaneProps } from './GraphVisualizer/DefaultPanelContent/DefaultOverviewPane'

export {
  REL_ON_CANVAS_CREATE,
  NODE_ON_CANVAS_CREATE,
  NODE_PROP_UPDATE,
  NODE_LABEL_UPDATE,
  REL_TYPE_UPDATE
} from './GraphVisualizer/Graph/GraphEventHandlerModel'
export type { GraphInteractionCallBack } from './GraphVisualizer/Graph/GraphEventHandlerModel'

export const resources = {
  en: {
    translation: {
      'graph summary':
        'Displaying {{nodeCount}} nodes, {{relationshipCount}} relationships.',
      'Relationship types': 'Relationship types',
      'Node labels': 'Node labels'
    }
  },
  zh: {
    translation: {
      'graph summary': '总计 {{nodeCount}} 个节点, {{relationshipCount}} 条边.',
      'Relationship types': '关系类型',
      'Node labels': '节点类型'
    }
  }
}
