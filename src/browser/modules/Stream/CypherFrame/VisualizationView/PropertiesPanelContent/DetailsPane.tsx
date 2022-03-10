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

import {
  GraphStyleModel,
  NodeItem,
  RelationshipItem
} from 'graph-visualization'

import { ClipboardCopier, PropertiesTable, upperFirst } from 'common'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import { PaneBody, PaneHeader, PaneTitle } from './styled'

export const DETAILS_PANE_STEP_SIZE = 1000
export type DetailsPaneComponentProps = {
  vizItem: NodeItem | RelationshipItem
  graphStyle: GraphStyleModel
  nodeInspectorWidth: number
}
export function DetailsPaneComponent({
  vizItem,
  graphStyle,
  nodeInspectorWidth
}: DetailsPaneComponentProps): JSX.Element {
  const [maxPropertiesCount, setMaxPropertiesCount] = useState(
    DETAILS_PANE_STEP_SIZE
  )

  /* Add id to property list */
  const allItemProperties = [
    { key: '<id>', value: `${vizItem.item.id}`, type: 'String' },
    ...vizItem.item.propertyList
  ].sort((a, b) => (a.key < b.key ? -1 : 1))
  const visibleItemProperties = allItemProperties.slice(0, maxPropertiesCount)

  const handleMorePropertiesClick = (numMore: number) => {
    setMaxPropertiesCount(maxPropertiesCount + numMore)
  }

  return (
    <>
      <PaneHeader>
        <PaneTitle>
          {upperFirst(vizItem.type)} Properties{' '}
          <ClipboardCopier
            textToCopy={allItemProperties
              .map(prop => `${prop.key}: ${prop.value}`)
              .join('\n')}
            titleText="Copy all properties to clipboard"
            iconSize={10}
          />
        </PaneTitle>
        {vizItem.type === 'relationship' && (
          <StyleableRelType
            selectedRelType={{
              propertyKeys: vizItem.item.propertyList.map(p => p.key),
              relType: vizItem.item.type
            }}
            graphStyle={graphStyle}
          />
        )}
        {vizItem.type === 'node' &&
          vizItem.item.labels.map((label: string) => {
            return (
              <StyleableNodeLabel
                key={label}
                graphStyle={graphStyle}
                selectedLabel={{
                  label,
                  propertyKeys: vizItem.item.propertyList.map(p => p.key)
                }}
              />
            )
          })}
      </PaneHeader>
      <PaneBody>
        <PropertiesTable
          visibleProperties={visibleItemProperties}
          onMoreClick={handleMorePropertiesClick}
          moreStep={DETAILS_PANE_STEP_SIZE}
          totalNumItems={allItemProperties.length}
          nodeInspectorWidth={nodeInspectorWidth}
        />
      </PaneBody>
    </>
  )
}
