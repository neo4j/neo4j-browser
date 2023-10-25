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

import { GraphStyleModel } from '../../models/GraphStyle'
import { NonClickableRelTypeChip } from './styled'
import {
  GraphInteractionCallBack,
  REL_TYPE_UPDATE
} from '../Graph/GraphEventHandlerModel'

export type RelTypeProps = {
  graphStyle: GraphStyleModel
  selectedRelType: { relType: string; propertyKeys: string[]; count?: number }
  onGraphInteraction?: GraphInteractionCallBack
  sourceNodeId?: string
  targetNodeId?: string
}
RelType.defaultProps = {
  onGraphInteraction: () => undefined
}
export function RelType({
  selectedRelType,
  graphStyle,
  onGraphInteraction = () => undefined,
  sourceNodeId,
  targetNodeId
}: RelTypeProps): JSX.Element {
  const styleForRelType = graphStyle.forRelationship({
    type: selectedRelType.relType
  })
  return (
    <div
      suppressContentEditableWarning={true}
      contentEditable="true"
      onInput={e =>
        onGraphInteraction(REL_TYPE_UPDATE, {
          sourceNodeId: sourceNodeId,
          targetNodeId: targetNodeId,
          oldType: selectedRelType.relType,
          newType: e.currentTarget.textContent
        })
      }
    >
      <NonClickableRelTypeChip
        style={{
          backgroundColor: styleForRelType.get('color'),
          color: styleForRelType.get('text-color-internal')
        }}
      >
        {selectedRelType.count !== undefined
          ? `${selectedRelType.relType} (${selectedRelType.count})`
          : `${selectedRelType.relType}`}
      </NonClickableRelTypeChip>
    </div>
  )
}
