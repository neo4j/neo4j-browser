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

import { ClickableUrls } from '../ClickableUrls'
import {
  AlternatingTable,
  CopyCell,
  KeyCell,
  StyledExpandValueButton,
  StyledInlineList,
  ValueCell
} from './PropertiesTable.style'
import { ClipboardCopier } from '../ClipboardCopier'
import { ShowMoreOrAll } from '../ShowMoreOrAll/ShowMoreOrAll'
import { VizItemProperty } from 'neo4j-arc/common'

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
export const PropertiesTable = ({
  visibleProperties,
  totalNumItems,
  onMoreClick,
  moreStep,
  nodeInspectorWidth
}: PropertiesViewProps): JSX.Element => {
  return (
    <>
      <StyledInlineList>
        <AlternatingTable>
          <tbody data-testid="viz-details-pane-properties-table">
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
                    iconSize={12}
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
