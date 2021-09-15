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
  StyledTokenRelationshipType,
  StyledLabelToken,
  StyledInspectorFooterRow,
  StyledInspectorFooterRowListKey,
  StyledInspectorFooterRowListValue,
  StyledInlineList,
  StyledDetailsStatusBar,
  StyledDetailsStatus,
  StyledDetailsStatusContents,
  StyledInspectorFooterRowListPairAlternatingRows,
  StyledInspectorClipboardCopyAll,
  StyledInspectorFooterRowListKeyValuePair
} from './styled'
import ClickableUrls from '../../../components/ClickableUrls'
import ClipboardCopier from 'browser-components/ClipboardCopier'
import { VizItem, VizNodeProperty } from './types'

const GraphItemProperties = ({
  id,
  properties
}: {
  id: string
  properties: VizNodeProperty[]
}) => {
  if (!properties.length) {
    return <div>No properties to display</div>
  }

  const allItemProperties = [
    { key: '<id>', value: `${id}`, type: 'string' },
    ...properties
  ].sort((a, b) => (a.key < b.key ? -1 : 1))

  return (
    <>
      <StyledInspectorClipboardCopyAll>
        <div style={{ marginLeft: 'auto', marginRight: '5px' }}>
          <ClipboardCopier
            textToCopy={allItemProperties
              .map(prop => `${prop.key}: ${prop.value}`)
              .join('\n')}
            iconSize={10}
            titleText={'Copy all properties to clipboard'}
          />
        </div>
      </StyledInspectorClipboardCopyAll>
      {allItemProperties.map(({ key, type, value }, index) => (
        <StyledInspectorFooterRowListPairAlternatingRows
          key={key}
          isOddRow={index % 2 === 1}
          title={type}
        >
          <StyledInspectorFooterRowListKeyValuePair>
            <StyledInspectorFooterRowListKey>
              {key}:
            </StyledInspectorFooterRowListKey>
            <StyledInspectorFooterRowListValue>
              <ClickableUrls text={value} />
            </StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListKeyValuePair>
          <div style={{ marginLeft: 'auto' }}>
            <ClipboardCopier textToCopy={`${key}: ${value}`} iconSize={10} />
          </div>
        </StyledInspectorFooterRowListPairAlternatingRows>
      ))}
    </>
  )
}

type DetailsPaneComponentProps = {
  vizItem: VizItem
  graphStyle: any
}

export function DetailsPaneComponent({
  vizItem,
  graphStyle
}: DetailsPaneComponentProps): JSX.Element {
  return (
    <StyledDetailsStatusBar>
      <StyledDetailsStatus>
        <StyledDetailsStatusContents>
          <StyledInspectorFooterRow data-testid="vizInspector">
            {vizItem.type === 'node' && (
              <StyledInlineList>
                {vizItem.item.labels.map((label: string) => {
                  const graphStyleForLabel = graphStyle.forNode({
                    labels: [label]
                  })

                  return (
                    <StyledLabelToken
                      key={label}
                      style={{
                        backgroundColor: graphStyleForLabel.get('color'),
                        color: graphStyleForLabel.get('text-color-internal'),
                        cursor: 'default'
                      }}
                    >
                      {label}
                    </StyledLabelToken>
                  )
                })}
                <GraphItemProperties
                  id={vizItem.item.id}
                  properties={vizItem.item.properties}
                />
              </StyledInlineList>
            )}

            {vizItem.type === 'relationship' && (
              <StyledInlineList>
                <StyledTokenRelationshipType
                  style={{
                    backgroundColor: graphStyle
                      .forRelationship(vizItem.item)
                      .get('color'),
                    color: graphStyle
                      .forRelationship(vizItem.item)
                      .get('text-color-internal'),
                    cursor: 'default'
                  }}
                >
                  {vizItem.item.type}
                </StyledTokenRelationshipType>
                <GraphItemProperties
                  id={vizItem.item.id}
                  properties={vizItem.item.properties}
                />
              </StyledInlineList>
            )}
          </StyledInspectorFooterRow>
        </StyledDetailsStatusContents>
      </StyledDetailsStatus>
    </StyledDetailsStatusBar>
  )
}
