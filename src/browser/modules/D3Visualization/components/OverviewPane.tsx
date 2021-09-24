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
import { Icon } from 'semantic-ui-react'

import { StyledLegendInlineList, PaneBody, PaneHeader } from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { StyleableNodeLabel } from './StyleableNodeLabel'
import { GraphStats } from '../mapper'
import { StylableRelType } from './StyleableRelType'
import styled from 'styled-components'

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
  const { relTypes, labels } = stats

  return (
    <>
      <PaneHeader>Results</PaneHeader>
      <PaneBody maxHeight={frameHeight - 45}>
        {labels && Object.keys(labels).length !== 0 && (
          <>
            Node labels
            <StyledLegendInlineList>
              {Object.keys(labels).map((label: string) => (
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
          </>
        )}
        {relTypes && Object.keys(relTypes).length !== 0 && (
          <>
            Relationship Types
            <StyledLegendInlineList>
              {Object.keys(relTypes).map(relType => (
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
          </>
        )}
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
      </PaneBody>
    </>
  )
}

export default OverviewPane
