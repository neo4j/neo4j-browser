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

import { NonClickableLabelChip } from './styled'

import { GraphStyleModel } from '../../models/GraphStyle'

export type NodeLabelProps = {
  selectedLabel: {
    label: string
    propertyKeys: string[]
    count?: number
  }
  graphStyle: GraphStyleModel
  /* The total number of nodes in returned graph */
  allNodesCount?: number | null
}
export function NodeLabel({
  graphStyle,
  selectedLabel,
  allNodesCount
}: NodeLabelProps): JSX.Element {
  const labels = selectedLabel.label === '*' ? [] : [selectedLabel.label]
  const graphStyleForLabel = graphStyle.forNode({
    labels: labels
  })
  const count =
    selectedLabel.label === '*' ? allNodesCount : selectedLabel.count

  return (
    <NonClickableLabelChip
      style={{
        backgroundColor: graphStyleForLabel.get('color'),
        color: graphStyleForLabel.get('text-color-internal')
      }}
    >
      {count !== undefined
        ? `${selectedLabel.label} (${count})`
        : `${selectedLabel.label}`}
    </NonClickableLabelChip>
  )
}
