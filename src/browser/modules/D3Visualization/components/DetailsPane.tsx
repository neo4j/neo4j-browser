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
import ClipboardCopier, {
  copyToClipboard
} from 'browser-components/ClipboardCopier'
import { NodeItem, RelationshipItem, VizNodeProperty } from './types'
import { GrassEditor } from './GrassEditor'
import { Popup } from 'semantic-ui-react'
import { GraphStyle } from './OverviewPane'
import styled from 'styled-components'

const AlternatingList = styled.ul`
  li:nth-child(even) {
    background: ${props => props.theme.alteringTableRowBackground};
  }
  li:nth-child(odd) {
    background: ${props => props.theme.editorBackground};
  }
`

const GraphItemProperties = ({
  properties
}: {
  properties: VizNodeProperty[]
}) => {
  if (!properties.length) {
    return <div>No properties to display</div>
  }

  return (
    <AlternatingList>
      {properties.map(({ key, type, value }) => (
        <StyledInspectorFooterRowListPairAlternatingRows key={key} title={type}>
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
    </AlternatingList>
  )
}

type DetailsPaneComponentProps = {
  vizItem: NodeItem | RelationshipItem
  graphStyle: GraphStyle
}

export function DetailsPaneComponent({
  vizItem,
  graphStyle
}: DetailsPaneComponentProps): JSX.Element {
  const allItemProperties = [
    { key: '<id>', value: `${vizItem.item.id}`, type: 'string' },
    ...vizItem.item.properties
  ].sort((a, b) => (a.key < b.key ? -1 : 1))

  return (
    <StyledDetailsStatusBar>
      <div
        style={{
          fontSize: '12px',
          paddingBottom: '5px',
          marginTop: '5px',
          marginBottom: '5px',
          borderBottom: '1px solid #DAE4F0'
        }}
      >
        {vizItem.type} properties.{' '}
        <ClipboardCopier
          textToCopy={allItemProperties
            .map(prop => `${prop.key}: ${prop.value}`)
            .join('\n')}
          iconSize={10}
          titleText={'Copy all properties to clipboard'}
        />
      </div>
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
                    <Popup
                      on="click"
                      basic
                      pinned
                      key={label}
                      trigger={
                        <StyledLabelToken
                          style={{
                            backgroundColor: graphStyleForLabel.get('color'),
                            color: graphStyleForLabel.get(
                              'text-color-internal'
                            ),
                            cursor: 'default'
                          }}
                        >
                          {label}
                        </StyledLabelToken>
                      }
                      wide
                    >
                      <GrassEditor
                        selectedLabel={{
                          label,
                          propertyKeys: vizItem.item.properties.map(p => p.key)
                        }}
                        frameHeight={500}
                      />
                    </Popup>
                  )
                })}
                <GraphItemProperties properties={allItemProperties} />
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
                <GraphItemProperties properties={allItemProperties} />
              </StyledInlineList>
            )}
          </StyledInspectorFooterRow>
        </StyledDetailsStatusContents>
      </StyledDetailsStatus>
    </StyledDetailsStatusBar>
  )
}
