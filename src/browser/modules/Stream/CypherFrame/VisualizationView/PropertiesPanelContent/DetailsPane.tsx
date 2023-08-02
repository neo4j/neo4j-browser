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
import React, { useCallback, useState } from 'react'

import { ClipboardCopier, PropertiesTable, upperFirst } from 'neo4j-arc/common'

import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import { PaneBody, PaneHeader, PaneTitle, PaneWrapper } from './styled'
import { DetailsPaneProps } from 'neo4j-arc'
import { withBus } from 'react-suber'
import {
  commandSources,
  executeCommand
} from 'project-root/src/shared/modules/commands/commandsDuck'

export const DETAILS_PANE_STEP_SIZE = 1000

function DetailsPaneRender({
  vizItem,
  graphStyle,
  nodeInspectorWidth,
  nodes,
  relationships,
  bus
}: DetailsPaneProps & { bus: any }): JSX.Element {
  const [maxPropertiesCount, setMaxPropertiesCount] = useState(
    DETAILS_PANE_STEP_SIZE
  )

  const idProperty = {
    key: '<id>',
    value: `${vizItem.item.id}`,
    type: 'String'
  }
  const allItemProperties = [idProperty, ...vizItem.item.propertyList].sort(
    (a, b) => (a.key < b.key ? -1 : 1)
  )
  const visibleItemProperties = allItemProperties.slice(0, maxPropertiesCount)

  const handleMorePropertiesClick = (numMore: number) => {
    setMaxPropertiesCount(maxPropertiesCount + numMore)
  }
  const executeCypher = useCallback(
    (cmd: string) => {
      const action = executeCommand(cmd, { source: commandSources.button })

      bus.send(action.type, action)
    },
    [bus]
  )
  return (
    <PaneWrapper>
      <PaneHeader>
        <PaneTitle>
          <span>{`${upperFirst(vizItem.type)} properties`}</span>
          <ClipboardCopier
            textToCopy={allItemProperties
              .map(prop => `${prop.key}: ${prop.value}`)
              .join('\n')}
            titleText="Copy all properties to clipboard"
            iconSize={12}
          />
        </PaneTitle>
        {vizItem.type === 'relationship' && (
          <StyleableRelType
            nodes={nodes}
            relationships={relationships}
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
                nodes={nodes}
                relationships={relationships}
                graphStyle={graphStyle}
                selectedLabel={{
                  label,
                  propertyKeys: vizItem.item.propertyList.map(p => p.key)
                }}
              />
            )
          })}
      </PaneHeader>
      <PaneBody data-testid="viz-details-pane-body">
        <PropertiesTable
          visibleProperties={visibleItemProperties}
          onMoreClick={handleMorePropertiesClick}
          moreStep={DETAILS_PANE_STEP_SIZE}
          totalNumItems={allItemProperties.length}
          nodeInspectorWidth={nodeInspectorWidth}
          executeCypher={executeCypher}
        />
      </PaneBody>
    </PaneWrapper>
  )
}

const DetailsPaneWithBus = withBus(DetailsPaneRender)

export function DetailsPane(props: DetailsPaneProps) {
  return <DetailsPaneWithBus {...props} />
}
