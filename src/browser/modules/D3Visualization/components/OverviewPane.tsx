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
  StyledTokenCount,
  StyledLegendInlineList,
  PaneBody,
  PaneHeader
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { GrassEditor } from './GrassEditor'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { LegendItem } from './types'
import {
  StyledLabel,
  StyledRelationship
} from 'browser/modules/DBMSInfo/styled'

export type GraphStyle = {
  forNode: any
  forRelationship: any
  loadRules: any
  resetToDefault: any
  rules: GraphStyleRule[]
  toSheet: any
}

type GraphStyleRule = {
  props: Record<string, string>
  selector: { classes: string[]; tag: string }
}

type OverviewPaneProps = {
  frameHeight: number
  graphStyle: GraphStyle
  hasTruncatedFields: boolean
  nodeCount: number | null
  relationshipCount: number | null
  selectLabel: (label: string, propertyKeys: string[]) => void
  selectRelType: (relType: string, propertyKeys: string[]) => void
  stats: { relTypes: any; labels: any }
  legendItem?: LegendItem
}

function OverviewPane({
  frameHeight,
  graphStyle,
  hasTruncatedFields,
  nodeCount,
  relationshipCount,
  selectLabel,
  selectRelType,
  stats,
  legendItem
}: OverviewPaneProps): JSX.Element {
  const { relTypes, labels } = stats

  return (
    <>
      <PaneHeader>
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
      </PaneHeader>
      <PaneBody maxHeight={frameHeight - 45}>
        {labels && Object.keys(labels).length !== 0 && (
          <>
            Node labels
            <StyledLegendInlineList>
              {Object.keys(labels).map(legendItemKey => {
                const styleForItem = graphStyle.forNode({
                  labels: [legendItemKey]
                })
                const onClick = () => {
                  selectLabel(
                    legendItemKey,
                    Object.keys(labels[legendItemKey].properties)
                  )
                }
                const style = {
                  backgroundColor: styleForItem.get('color'),
                  color: styleForItem.get('text-color-internal')
                }
                return (
                  <Popup
                    on="click"
                    key={legendItemKey}
                    basic
                    pinned
                    trigger={
                      <StyledLabel onClick={onClick} style={style}>
                        {legendItemKey}
                        <StyledTokenCount>{`(${numberToUSLocale(
                          labels[legendItemKey].count
                        )})`}</StyledTokenCount>
                      </StyledLabel>
                    }
                    wide
                  >
                    <GrassEditor
                      {...legendItem?.item}
                      frameHeight={frameHeight}
                    />
                  </Popup>
                )
              })}
            </StyledLegendInlineList>
          </>
        )}
        {relTypes && Object.keys(relTypes).length !== 0 && (
          <>
            Relationship Types
            <StyledLegendInlineList>
              {Object.keys(relTypes).map(legendItemKey => {
                const styleForItem = graphStyle.forRelationship({
                  type: legendItemKey
                })
                const onClick = () => {
                  selectRelType(
                    legendItemKey,
                    Object.keys(relTypes[legendItemKey].properties)
                  )
                }
                const style = {
                  backgroundColor: styleForItem.get('color'),
                  color: styleForItem.get('text-color-internal')
                }
                return (
                  <Popup
                    on="click"
                    basic
                    key={legendItemKey}
                    pinned
                    trigger={
                      <StyledRelationship onClick={onClick} style={style}>
                        {legendItemKey}
                        <StyledTokenCount>
                          {`(${numberToUSLocale(
                            relTypes[legendItemKey].count
                          )})`}
                        </StyledTokenCount>
                      </StyledRelationship>
                    }
                    wide
                  >
                    <GrassEditor
                      {...legendItem?.item}
                      frameHeight={frameHeight}
                    />
                  </Popup>
                )
              })}
            </StyledLegendInlineList>
          </>
        )}
      </PaneBody>
    </>
  )
}

export default OverviewPane
