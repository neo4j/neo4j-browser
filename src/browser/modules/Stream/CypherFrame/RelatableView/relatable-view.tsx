/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { get, head, map, slice } from 'lodash-es'
import { QueryResult, Record, isInt } from 'neo4j-driver'
import React, { useMemo } from 'react'
import { connect } from 'react-redux'

import {
  ClickableUrls,
  ClipboardCopier,
  WarningMessage
} from 'neo4j-arc/common'

import {
  StyledStatsBar,
  StyledStatsBarWarningMessageWrapper
} from '../../styled'
import {
  getBodyAndStatusBarMessages,
  resultHasTruncatedFields
} from '../helpers'
import Relatable from './relatable'
import {
  CopyIconAbsolutePositioner,
  RelatableStyleWrapper,
  StyledJsonPre,
  StyledPreSpan
} from './relatable-view.styled'
import Ellipsis from 'browser-components/Ellipsis'
import { GlobalState } from 'project-root/src/shared/globalState'
import { BrowserRequestResult } from 'project-root/src/shared/modules/requests/requestsDuck'
import {
  getMaxFieldItems,
  getMaxRows
} from 'project-root/src/shared/modules/settings/settingsDuck'
import arrayHasItems from 'project-root/src/shared/utils/array-has-items'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import { stringifyMod, unescapeDoubleQuotesForDisplay } from 'services/utils'

const RelatableView = connect((state: GlobalState) => ({
  maxRows: getMaxRows(state),
  maxFieldItems: getMaxFieldItems(state)
}))(RelatableViewComponent)

export default RelatableView

type RelatableViewComponentProps = {
  maxRows: number
  maxFieldItems: number
  result: BrowserRequestResult
  updated?: number
}
export function RelatableViewComponent({
  maxRows,
  maxFieldItems,
  result
}: RelatableViewComponentProps): JSX.Element | null {
  const records = useMemo(
    () => (result && 'records' in result ? result.records : []),
    [result]
  )

  const columns = useMemo(
    () => getColumns(records, Number(maxFieldItems)),
    [records, maxFieldItems]
  )
  const data = useMemo(() => slice(records, 0, maxRows), [records, maxRows])

  if (!arrayHasItems(columns)) {
    return <RelatableBodyMessage result={result} maxRows={maxRows} />
  }

  return (
    <RelatableStyleWrapper>
      {/* @ts-ignore */}
      <Relatable basic columns={columns} data={data} />
    </RelatableStyleWrapper>
  )
}

function getColumns(records: Record[], maxFieldItems: number) {
  const keys = get(head(records), 'keys', [])
  return map(keys, key => ({
    Header: key !== '' ? key : '``',
    accessor: (record: Record) => {
      const fieldItem = record.get(key)

      if (!Array.isArray(fieldItem)) return fieldItem

      return slice(fieldItem, 0, maxFieldItems)
    },
    Cell: CypherCell
  }))
}

type CypherCellProps = {
  cell: any
}
function CypherCell({ cell }: CypherCellProps) {
  const { value } = cell
  return renderCell(value)
}

const renderCell = (entry: any) => {
  if (Array.isArray(entry)) {
    const children = entry.map((item, index) => (
      <StyledPreSpan key={index}>
        {renderCell(item)}
        {index === entry.length - 1 ? null : ', '}
      </StyledPreSpan>
    ))
    return <StyledPreSpan>[{children}]</StyledPreSpan>
  } else if (typeof entry === 'object') {
    return renderObject(entry)
  } else {
    return (
      <ClickableUrls
        text={unescapeDoubleQuotesForDisplay(
          stringifyMod(entry, stringModifier, true)
        )}
        WrappingTag={StyledPreSpan}
      />
    )
  }
}

const renderObject = (entry: any) => {
  if (isInt(entry)) return entry.toString()
  if (entry === null) return <em>null</em>
  const text = unescapeDoubleQuotesForDisplay(
    stringifyMod(entry, stringModifier, true)
  )

  return (
    <StyledJsonPre>
      <CopyIconAbsolutePositioner>
        <ClipboardCopier textToCopy={text} />
      </CopyIconAbsolutePositioner>
      <ClickableUrls text={text} />
    </StyledJsonPre>
  )
}

type RelatableBodyMessageProps = {
  maxRows: number
  result: BrowserRequestResult
}
function RelatableBodyMessage({ maxRows, result }: RelatableBodyMessageProps) {
  const { bodyMessage } = getBodyAndStatusBarMessages(result, maxRows)

  return (
    <StyledStatsBar>
      <Ellipsis>{bodyMessage}</Ellipsis>
    </StyledStatsBar>
  )
}

export const RelatableStatusbar = connect((state: GlobalState) => ({
  maxRows: getMaxRows(state),
  maxFieldItems: getMaxFieldItems(state)
}))(RelatableStatusbarComponent)

type RelatableStatusBarComponentProps = {
  maxRows: number
  maxFieldItems: number
  result?: QueryResult | BrowserRequestResult | null
  updated?: number
}
export function RelatableStatusbarComponent({
  maxRows,
  result,
  maxFieldItems
}: RelatableStatusBarComponentProps): JSX.Element {
  const hasTruncatedFields = useMemo(
    () => resultHasTruncatedFields(result, maxFieldItems),
    [result, maxFieldItems]
  )
  const { statusBarMessage } = useMemo(
    () => getBodyAndStatusBarMessages(result, maxRows),
    [result, maxRows]
  )

  return (
    <StyledStatsBar>
      {hasTruncatedFields && (
        <StyledStatsBarWarningMessageWrapper>
          <WarningMessage text={'Record fields have been truncated.'} />
        </StyledStatsBarWarningMessageWrapper>
      )}
      {statusBarMessage && (
        <Ellipsis>
          <span>{statusBarMessage}</span>
        </Ellipsis>
      )}
    </StyledStatsBar>
  )
}
