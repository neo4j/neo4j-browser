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

import ClickableUrls from '../../../components/ClickableUrls'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StyleableRelType } from './StyleableRelType'
import {
  AlternatingTable,
  CopyCell,
  KeyCell,
  PaneBody,
  PaneHeader,
  PaneTitle,
  StyledExpandValueButton,
  StyledInlineList,
  ValueCell
} from './styled'
import { NodeItem, RelationshipItem, VizItemProperty } from './types'
import ClipboardCopier from 'browser-components/ClipboardCopier'
import { ShowMoreOrAll } from 'browser-components/ShowMoreOrAll/ShowMoreOrAll'
import { GraphStyle } from 'project-root/src/browser/modules/D3Visualization/graphStyle'
import { upperFirst } from 'services/utils'

export const ELLIPSIS = '\u2026'
export const WIDE_VIEW_THRESHOLD = 900
export const MAX_LENGTH_NARROW = 150
export const MAX_LENGTH_WIDE = 300
type ExpandableValueProps = {
  value: string
  width: number
  type: string
}
function ExpandableValue({ value, width, type }: ExpandableValueProps) {
  const [expanded, setExpanded] = useState(false)

  const maxLength =
    width > WIDE_VIEW_THRESHOLD ? MAX_LENGTH_WIDE : MAX_LENGTH_NARROW

  const handleExpandClick = () => {
    setExpanded(true)
  }

  let valueShown = expanded ? value : value.slice(0, maxLength)
  const valueIsTrimmed = valueShown.length !== value.length
  valueShown += valueIsTrimmed ? ELLIPSIS : ''

  return (
    <>
      {type.startsWith('Array') && '['}
      <ClickableUrls text={valueShown} />
      {valueIsTrimmed && (
        <StyledExpandValueButton onClick={handleExpandClick}>
          {' Show all'}
        </StyledExpandValueButton>
      )}
      {type.startsWith('Array') && ']'}
    </>
  )
}

type PropertiesViewProps = {
  visibleProperties: VizItemProperty[]
  onMoreClick: (numMore: number) => void
  totalNumItems: number
  moreStep: number
  nodeInspectorWidth: number
}
function PropertiesView({
  visibleProperties,
  totalNumItems,
  onMoreClick,
  moreStep,
  nodeInspectorWidth
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
                  <ExpandableValue
                    value={value}
                    width={nodeInspectorWidth}
                    type={type}
                  />
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
        <PropertiesView
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
