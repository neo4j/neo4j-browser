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
import { Icon } from 'semantic-ui-react'

import {
  StyledLegendInlineList,
  PaneBody,
  PaneHeader,
  PaneBodySectionTitle,
  PaneBodySectionSmallText,
  PaneBodySectionHeaderWrapper
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { GraphStats } from '../mapper'
import { StylableRelType } from './StyleableRelType'
import { ShowMoreOrAll } from 'browser-components/ShowMoreOrAll/ShowMoreOrAll'

type PaneBodySectionHeaderProps = {
  title: string
  numOfElementsVisible: number
  totalNumOfElements: number
}
function PaneBodySectionHeader({
  title,
  numOfElementsVisible,
  totalNumOfElements
}: PaneBodySectionHeaderProps) {
  return (
    <PaneBodySectionHeaderWrapper>
      <PaneBodySectionTitle>{title}</PaneBodySectionTitle>
      {numOfElementsVisible < totalNumOfElements && (
        <PaneBodySectionSmallText>
          {`(showing ${numOfElementsVisible} of ${totalNumOfElements})`}
        </PaneBodySectionSmallText>
      )}
    </PaneBodySectionHeaderWrapper>
  )
}

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
  stats: GraphStats
}

function OverviewPane({
  frameHeight,
  graphStyle,
  hasTruncatedFields,
  nodeCount,
  relationshipCount,
  stats
}: OverviewPaneProps): JSX.Element {
  const moreStep = 50
  const [labelsMax, setLabelsMax] = useState(moreStep)
  const [relationshipsMax, setRelationshipsMax] = useState(moreStep)

  function onMoreClick(type: any, currentMax: number) {
    const map: any = {
      labels: setLabelsMax,
      relationships: setRelationshipsMax
    }
    return (num: number) => map[type](currentMax + num)
  }

  const { relTypes, labels } = stats
  const visibleLabelKeys = labels ? Object.keys(labels).slice(0, labelsMax) : []
  const visibleRelationshipKeys = relTypes
    ? Object.keys(relTypes).slice(0, relationshipsMax)
    : []
  const totalNumOfLabelTypes = labels ? Object.keys(labels).length : 0
  const totalNumOfRelTypes = relTypes ? Object.keys(relTypes).length : 0

  return (
    <>
      <PaneHeader>{'Overview'}</PaneHeader>
      <PaneBody>
        {labels && visibleLabelKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Node labels'}
              numOfElementsVisible={visibleLabelKeys.length}
              totalNumOfElements={totalNumOfLabelTypes}
            />
            <StyledLegendInlineList>
              {visibleLabelKeys.map((label: string) => (
                <StyleableNodeLabel
                  key={label}
                  graphStyle={graphStyle}
                  frameHeight={frameHeight}
                  selectedLabel={{
                    label,
                    propertyKeys: Object.keys(labels[label].properties)
                  }}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfLabelTypes}
              shown={visibleLabelKeys.length}
              moreStep={moreStep}
              onMore={onMoreClick('labels', labelsMax)}
            />
          </div>
        )}
        {relTypes && visibleRelationshipKeys.length !== 0 && (
          <div>
            <PaneBodySectionHeader
              title={'Relationship Types'}
              numOfElementsVisible={visibleRelationshipKeys.length}
              totalNumOfElements={totalNumOfRelTypes}
            />
            <StyledLegendInlineList>
              {visibleRelationshipKeys.map(relType => (
                <StylableRelType
                  key={relType}
                  graphStyle={graphStyle}
                  frameHeight={frameHeight}
                  selectedRelType={{
                    relType,
                    propertyKeys: Object.keys(relTypes[relType].properties)
                  }}
                />
              ))}
            </StyledLegendInlineList>
            <ShowMoreOrAll
              total={totalNumOfRelTypes}
              shown={visibleRelationshipKeys.length}
              moreStep={moreStep}
              onMore={onMoreClick('relationships', relationshipsMax)}
            />
          </div>
        )}
        <div style={{ paddingBottom: '10px' }}>
          {hasTruncatedFields && (
            <StyledTruncatedMessage>
              <Icon name="warning sign" /> Record fields have been
              truncated.&nbsp;
            </StyledTruncatedMessage>
          )}
          {nodeCount !== null &&
            relationshipCount !== null &&
            `Displaying ${numberToUSLocale(
              nodeCount
            )} nodes, ${numberToUSLocale(relationshipCount)} relationships.`}
        </div>
      </PaneBody>
    </>
  )
}

export default OverviewPane
