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
import { Popup } from 'semantic-ui-react'

import { GrassEditor } from './GrassEditor'
import { StyledRelationship } from 'browser/modules/DBMSInfo/styled'
import { GraphStyle } from 'project-root/src/browser/modules/D3Visualization/graphStyle'

export type StyleableRelTypeProps = {
  graphStyle: GraphStyle
  selectedRelType: { relType: string; propertyKeys: string[]; count?: number }
}
export function StyleableRelType({
  selectedRelType,
  graphStyle
}: StyleableRelTypeProps): JSX.Element {
  const styleForRelType = graphStyle.forRelationship({
    type: selectedRelType.relType
  })
  return (
    <Popup
      on="click"
      basic
      pinned
      key={selectedRelType.relType}
      trigger={
        <StyledRelationship
          style={{
            backgroundColor: styleForRelType.get('color'),
            color: styleForRelType.get('text-color-internal')
          }}
          data-testid={`property-details-overview-relationship-type-${selectedRelType.relType}`}
        >
          {selectedRelType.count !== undefined
            ? `${selectedRelType.relType} (${selectedRelType.count})`
            : `${selectedRelType.relType}`}
        </StyledRelationship>
      }
      wide
    >
      <GrassEditor selectedRelType={selectedRelType} />
    </Popup>
  )
}
