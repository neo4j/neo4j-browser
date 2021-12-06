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
import { GrassEditor } from './GrassEditor'
import { Popup } from 'semantic-ui-react'
import { GraphStyle } from './OverviewPane'
import { StyledLabel } from 'browser/modules/DBMSInfo/styled'

export type StyleableNodeLabelProps = {
  selectedLabel: {
    label: string
    propertyKeys: string[]
    count?: number
  }
  graphStyle: GraphStyle
  frameHeight: number
  onClick?: () => void
}
export function StyleableNodeLabel({
  graphStyle,
  frameHeight,
  selectedLabel,
  onClick
}: StyleableNodeLabelProps): JSX.Element {
  const labels = selectedLabel.label === '*' ? [] : [selectedLabel.label]
  const graphStyleForLabel = graphStyle.forNode({
    labels: labels
  })

  return (
    <Popup
      on="click"
      basic
      pinned
      key={selectedLabel.label}
      trigger={
        <StyledLabel
          {...onClick}
          style={{
            backgroundColor: graphStyleForLabel.get('color'),
            color: graphStyleForLabel.get('text-color-internal')
          }}
          data-testid={`property-details-overview-node-label-${selectedLabel.label}`}
        >
          {selectedLabel.count !== undefined
            ? `${selectedLabel.label} (${selectedLabel.count})`
            : `${selectedLabel.label}`}
        </StyledLabel>
      }
      wide
    >
      <GrassEditor selectedLabel={selectedLabel} frameHeight={frameHeight} />
    </Popup>
  )
}
