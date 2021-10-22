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
import { NodeItem, RelationshipItem } from './types'
import { GraphStyle } from './OverviewPane'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { StylableRelType } from './StyleableRelType'
import { upperFirst } from 'services/utils'

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
  const allItemProperties = [
    { key: '<id>', value: `${vizItem.item.id}`, type: 'String' },
    ...vizItem.item.properties
  ].sort((a, b) => (a.key < b.key ? -1 : 1))

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
          <StylableRelType
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
        <StyledInlineList>
          <AlternatingTable>
            <tbody>
              {allItemProperties.map(({ key, type, value }) => (
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
      </PaneBody>
    </>
  )
}
