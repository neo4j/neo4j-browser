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
import { Popup } from 'semantic-ui-react'

import {
  StyledLegendRow,
  StyledTokenRelationshipType,
  StyledLegendInlineListItem,
  StyledLegend,
  StyledLegendContents,
  StyledLabelToken,
  StyledTokenCount,
  StyledLegendInlineList
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { GrassEditor } from './GrassEditor'

type ResultPaneProps = {
  graphStyle: any
  onSelectedLabel: (a: any, b: any) => void
  onSelectedRelType: (a: any, b: any) => void
  frameHeight: number
  selectedLabel: any
  stats: any
}

function ResultsPane({
  graphStyle,
  onSelectedLabel,
  onSelectedRelType,
  frameHeight,
  selectedLabel,
  stats
}: ResultPaneProps): JSX.Element {
  const { relTypes, labels } = stats

  return (
    <StyledLegend>
      Node Labels:
      {!labels || !Object.keys(labels).length ? (
        <div>No labels to display</div>
      ) : (
        <StyledLegendRow>
          <StyledLegendInlineList className="list-inline">
            {Object.keys(labels).map((legendItemKey, index) => {
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
                  key={index}
                  data-testid="viz-legend-labels"
                >
                  <StyledLegendContents className="contents">
                    <Popup
                      on="click"
                      basic
                      pinned
                      trigger={
                        <StyledLabelToken
                          onClick={onClick}
                          style={style}
                          className="token token-label"
                        >
                          {legendItemKey}
                          <StyledTokenCount className="count">{`(${numberToUSLocale(
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
                  </StyledLegendContents>
                </StyledLegendInlineListItem>
              )
            })}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )}
      Relationship Types:
      {!relTypes || !Object.keys(relTypes).length ? (
        <div>No relationship types to display</div>
      ) : (
        <StyledLegendRow>
          <StyledLegendInlineList className="list-inline">
            {Object.keys(relTypes).map((legendItemKey, i) => {
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
                  key={i}
                  data-testid="viz-legend-reltypes"
                >
                  <StyledLegendContents className="contents">
                    <Popup
                      on="click"
                      basic
                      pinned
                      trigger={
                        <StyledTokenRelationshipType
                          onClick={onClick}
                          style={style}
                          className="token token-relationship-type"
                        >
                          {legendItemKey}
                          <StyledTokenCount className="count">
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
                  </StyledLegendContents>
                </StyledLegendInlineListItem>
              )
            })}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )}
    </StyledLegend>
  )
}

export default ResultsPane
