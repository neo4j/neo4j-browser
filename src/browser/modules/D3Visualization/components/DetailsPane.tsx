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
  optionalToString,
  stringifyMod,
  unescapeDoubleQuotesForDisplay
} from 'services/utils'
import {
  StyledTokenRelationshipType,
  StyledLabelToken,
  StyledInspectorFooterRow,
  StyledInspectorFooterRowListPair,
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
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { Icon } from 'semantic-ui-react'
import ClipboardCopier from 'browser-components/ClipboardCopier'
import { VizItem, VizNodeProperty } from './types'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'

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
    { key: '<id>', value: `${id}` },
    ...properties
  ].sort((a, b) => (a.key < b.key ? -1 : 1))
  const formatForDisplay = (neo4jValue: unknown) =>
    unescapeDoubleQuotesForDisplay(
      stringifyMod(neo4jValue, stringModifier, true)
    )

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
      {allItemProperties.map((property, index) => (
        <StyledInspectorFooterRowListPairAlternatingRows
          className="pair"
          key={property.key}
          isOddRow={index % 2 === 1}
        >
          <StyledInspectorFooterRowListKeyValuePair>
            <StyledInspectorFooterRowListKey className="key">
              {property.key + ': '}
            </StyledInspectorFooterRowListKey>
            <StyledInspectorFooterRowListValue className="value">
              <ClickableUrls text={formatForDisplay(property.value)} />
            </StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListKeyValuePair>
          <div style={{ marginLeft: 'auto' }}>
            <ClipboardCopier
              textToCopy={`${property.key}: ${formatForDisplay(
                property.value
              )}`}
              iconSize={10}
            />
          </div>
        </StyledInspectorFooterRowListPairAlternatingRows>
      ))}
    </>
  )
}

type DetailsPaneComponentProps = {
  hasTruncatedFields: boolean
  hoveredItem: VizItem
  selectedItem: VizItem
  graphStyle: any
}

export function DetailsPaneComponent({
  hoveredItem,
  selectedItem,
  hasTruncatedFields,
  graphStyle
}: DetailsPaneComponentProps): JSX.Element {
  const hoveringNodeOrRelationship =
    hoveredItem &&
    (hoveredItem.type === 'node' || hoveredItem.type === 'relationship')

  const shownEl = hoveringNodeOrRelationship ? hoveredItem : selectedItem

  return (
    <StyledDetailsStatusBar className="status-bar">
      <StyledDetailsStatus className="status">
        <StyledDetailsStatusContents className="inspector-footer">
          <StyledInspectorFooterRow
            data-testid="vizInspector"
            className="inspector-footer-row"
          >
            {shownEl.type === 'canvas' && (
              <StyledInlineList className="list-inline">
                <StyledInspectorFooterRowListPair className="pair" key="pair">
                  <StyledInspectorFooterRowListValue className="value">
                    {hasTruncatedFields && (
                      <StyledTruncatedMessage>
                        <Icon name="warning sign" /> Record fields have been
                        truncated.&nbsp;
                      </StyledTruncatedMessage>
                    )}
                    Displaying {numberToUSLocale(shownEl.item.nodeCount)} nodes,{' '}
                    {numberToUSLocale(shownEl.item.relationshipCount)}{' '}
                    relationships.
                  </StyledInspectorFooterRowListValue>
                </StyledInspectorFooterRowListPair>
              </StyledInlineList>
            )}

            {shownEl.type === 'node' && (
              <StyledInlineList className="list-inline">
                {shownEl.item.labels.map((label: string) => {
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
                      className="token token-label"
                    >
                      {label}
                    </StyledLabelToken>
                  )
                })}
                <GraphItemProperties
                  id={shownEl.item.id}
                  properties={shownEl.item.properties}
                />
              </StyledInlineList>
            )}

            {shownEl.type === 'relationship' && (
              <StyledInlineList className="list-inline">
                <StyledTokenRelationshipType
                  key="token"
                  style={{
                    backgroundColor: graphStyle
                      .forRelationship(shownEl.item)
                      .get('color'),
                    color: graphStyle
                      .forRelationship(shownEl.item)
                      .get('text-color-internal'),
                    cursor: 'default'
                  }}
                  className="token token-relationship-type"
                >
                  {shownEl.item.type}
                </StyledTokenRelationshipType>
                <GraphItemProperties
                  id={shownEl.item.id}
                  properties={shownEl.item.properties}
                />
              </StyledInlineList>
            )}
          </StyledInspectorFooterRow>
        </StyledDetailsStatusContents>
      </StyledDetailsStatus>
    </StyledDetailsStatusBar>
  )
}
