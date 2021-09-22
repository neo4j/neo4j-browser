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
import { Icon, Popup } from 'semantic-ui-react'

import {
  StyledTokenRelationshipType,
  StyledLegendInlineListItem,
  StyledLabelToken,
  StyledTokenCount,
  StyledInlineList
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { GrassEditor } from './GrassEditor'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'

export type GraphStyle = {
  rules: GraphStyleRule[]
  resetToDefault: any
  loadRules: any
  toSheet: any
  forNode: any
  forRelationship: any
}
type GraphStyleRule = {
  props: Record<string, string>
  selector: { classes: string[]; tag: string }
}

type OverviewPaneProps = {
  graphStyle: GraphStyle
  onSelectedLabel: (a: any, b: any) => void
  onSelectedRelType: (a: any, b: any) => void
  frameHeight: number
  selectedLabel: any
  stats: {
    relTypes: any
    labels: any
  }
  hasTruncatedFields: boolean
  nodeCount: number | null
  relationshipCount: number | null
}

function OverviewPane({
  graphStyle,
  onSelectedLabel,
  onSelectedRelType,
  frameHeight,
  selectedLabel,
  stats,
  hasTruncatedFields,
  nodeCount,
  relationshipCount
}: OverviewPaneProps): JSX.Element {
  const { relTypes, labels } = stats

  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          marginTop: '5px',
          marginBottom: '5px',
          borderBottom: '1px solid #DAE4F0',
          height: '25px'
        }}
      >
        {hasTruncatedFields && (
          <StyledTruncatedMessage>
            <Icon name="warning sign" /> Record fields have been
            truncated.&nbsp;
          </StyledTruncatedMessage>
        )}
        {nodeCount !== null &&
          relationshipCount !== null &&
          `Displaying ${numberToUSLocale(nodeCount)} nodes, ${numberToUSLocale(
            relationshipCount
          )} relationships.`}
      </div>
      <div
        style={{
          maxHeight: `${frameHeight - 40}px`,
          overflow: 'auto'
        }}
      >
        Node labels
        {!labels || !Object.keys(labels).length ? (
          <div>No labels to display</div>
        ) : (
          <StyledInlineList>
            {Object.keys(labels).map(legendItemKey => {
              const styleForItem = graphStyle.forNode({
                labels: [legendItemKey]
              })
              const onClick = () => {
                onSelectedLabel(
                  legendItemKey,
                  Object.keys(labels[legendItemKey].properties)
                )
              }
              const style = {
                backgroundColor: styleForItem.get('color'),
                color: styleForItem.get('text-color-internal')
              }
              return (
                <StyledLegendInlineListItem
                  key={legendItemKey}
                  data-testid="viz-legend-labels"
                >
                  <Popup
                    on="click"
                    basic
                    pinned
                    trigger={
                      <StyledLabelToken onClick={onClick} style={style}>
                        {legendItemKey}
                        <StyledTokenCount>{`(${numberToUSLocale(
                          labels[legendItemKey].count
                        )})`}</StyledTokenCount>
                      </StyledLabelToken>
                    }
                    wide
                  >
                    <GrassEditor
                      selectedLabel={selectedLabel?.item?.selectedLabel}
                      frameHeight={frameHeight}
                    />
                  </Popup>
                </StyledLegendInlineListItem>
              )
            })}
          </StyledInlineList>
        )}
        Relationship Types
        {!relTypes || !Object.keys(relTypes).length ? (
          <div>No relationship types to display</div>
        ) : (
          <StyledInlineList>
            {Object.keys(relTypes).map(legendItemKey => {
              const styleForItem = graphStyle.forRelationship({
                type: legendItemKey
              })
              const onClick = () => {
                onSelectedRelType(
                  legendItemKey,
                  Object.keys(relTypes[legendItemKey].properties)
                )
              }
              const style = {
                backgroundColor: styleForItem.get('color'),
                color: styleForItem.get('text-color-internal')
              }
              return (
                <StyledLegendInlineListItem
                  key={legendItemKey}
                  data-testid="viz-legend-reltypes"
                >
                  <Popup
                    on="click"
                    basic
                    pinned
                    trigger={
                      <StyledTokenRelationshipType
                        onClick={onClick}
                        style={style}
                      >
                        {legendItemKey}
                        <StyledTokenCount>
                          {`(${numberToUSLocale(
                            relTypes[legendItemKey].count
                          )})`}
                        </StyledTokenCount>
                      </StyledTokenRelationshipType>
                    }
                    wide
                  >
                    <GrassEditor
                      selectedRelType={selectedLabel?.item?.selectedRelType}
                      frameHeight={frameHeight}
                    />
                  </Popup>
                </StyledLegendInlineListItem>
              )
            })}
          </StyledInlineList>
        )}
      </div>
    </div>
  )
}

export default OverviewPane
