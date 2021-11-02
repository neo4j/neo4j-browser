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
  AlternatingTable,
  CopyCell,
  KeyCell,
  PaneBody,
  PaneHeader,
  PaneTitle,
  StyledInlineList,
  ValueCell
} from './styled'
import ClickableUrls from '../../../components/ClickableUrls'
import ClipboardCopier from 'browser-components/ClipboardCopier'
import { NodeItem, RelationshipItem, VizNodeProperty } from './types'
import { GraphStyle } from './OverviewPane'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import { upperFirst } from 'services/utils'
import { ShowMoreOrAll } from 'browser-components/ShowMoreOrAll/ShowMoreOrAll'

type PropertiesViewProps = {
  visibleProperties: VizNodeProperty[]
  onMoreClick: (numMore: number) => void
  totalNumItems: number
  moreStep: number
}
function PropertiesView({
  visibleProperties,
  totalNumItems,
  onMoreClick,
  moreStep
}: PropertiesViewProps) {
  return (
    <>
      <StyledInlineList>
        <AlternatingTable>
          <tbody>
            {visibleProperties.map(({ key, type, value }) => (
              <tr key={key} title={type}>
                <KeyCell>
                  <ClickableUrls text={key} />
                </KeyCell>
                <ValueCell>
                  <ClickableUrls text={value} />
                </ValueCell>
                <CopyCell>
                  <ClipboardCopier
                    titleText={'Copy key and value'}
                    textToCopy={`${key}: ${value}`}
                    iconSize={10}
                  />
                </CopyCell>
              </tr>
            ))}
          </tbody>
        </AlternatingTable>
      </StyledInlineList>
      <ShowMoreOrAll
        total={totalNumItems}
        shown={visibleProperties.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </>
  )
}

export const DETAILS_PANE_STEP_SIZE = 1000
type DetailsPaneComponentProps = {
  vizItem: NodeItem | RelationshipItem
  graphStyle: GraphStyle
  frameHeight: number
}
export function DetailsPaneComponent({
  vizItem,
  graphStyle,
  frameHeight
}: DetailsPaneComponentProps): JSX.Element {
  const [maxPropertiesCount, setMaxPropertiesCount] = useState(
    DETAILS_PANE_STEP_SIZE
  )

  const allItemProperties = [
    { key: '<id>', value: `${vizItem.item.id}`, type: 'String' },
    ...vizItem.item.properties
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
              propertyKeys: vizItem.item.properties.map(p => p.key),
              relType: vizItem.item.type
            }}
            frameHeight={frameHeight}
            graphStyle={graphStyle}
          />
        )}
        {vizItem.type === 'node' &&
          vizItem.item.labels.map((label: string) => {
            return (
              <StyleableNodeLabel
                key={label}
                frameHeight={frameHeight}
                graphStyle={graphStyle}
                selectedLabel={{
                  label,
                  propertyKeys: vizItem.item.properties.map(p => p.key)
                }}
              />
            )
          })}
      </PaneHeader>
      <PaneBody>
        <PropertiesView
          visibleProperties={visibleItemProperties}
          onMoreClick={handleMorePropertiesClick}
          moreStep={DETAILS_PANE_STEP_SIZE}
          totalNumItems={allItemProperties.length}
        />
      </PaneBody>
    </>
  )
}
