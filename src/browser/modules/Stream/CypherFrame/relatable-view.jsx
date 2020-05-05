/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import React, { useCallback, useMemo } from 'react'
import Relatable from '@relate-by-ui/relatable'
import {
  entries,
  filter,
  get,
  head,
  join,
  map,
  memoize,
  slice
} from 'lodash-es'
import { Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'

import { HTMLEntities } from 'services/santize.utils'
import {
  getBodyAndStatusBarMessages,
  mapNeo4jValuesToPlainValues,
  resultHasTruncatedFields
} from './helpers'
import arrayHasItems from 'shared/utils/array-has-items'
import {
  getMaxFieldItems,
  getMaxRows
} from 'shared/modules/settings/settingsDuck'

import ClickableUrls, {
  convertUrlsToHrefTags
} from '../../../components/clickable-urls'
import { StyledStatsBar, StyledTruncatedMessage } from '../styled'
import Ellipsis from '../../../components/Ellipsis'
import { RelatableStyleWrapper, StyledJsonPre } from './relatable-view.styled'
import { isPoint } from 'neo4j-driver'

const RelatableView = connect(state => ({
  maxRows: getMaxRows(state),
  maxFieldItems: getMaxFieldItems(state)
}))(RelatableViewComponent)

export default RelatableView

export function RelatableViewComponent({ maxRows, result, maxFieldItems }) {
  const { records = [] } = result
  const columns = useMemo(() => getColumns(records, Number(maxFieldItems)), [
    result,
    maxFieldItems
  ])
  const data = useMemo(() => slice(records, 0, maxRows), [records, maxRows])

  if (!arrayHasItems(columns)) {
    return <RelatableBodyMessage result={result} maxRows={maxRows} />
  }

  return (
    <RelatableStyleWrapper>
      <Relatable basic columns={columns} data={data} />
    </RelatableStyleWrapper>
  )
}

function getColumns(records, maxFieldItems) {
  const keys = get(head(records), 'keys', [])

  return map(keys, key => ({
    Header: key,
    accessor: record => {
      const fieldItem = record.get(key)

      if (!Array.isArray(fieldItem)) return fieldItem

      return slice(fieldItem, 0, maxFieldItems)
    },
    Cell: CypherCell
  }))
}

function CypherCell({ cell }) {
  const { value } = cell
  const mapper = useCallback(
    value => {
      const memo = memoize(mapNeo4jValuesToPlainValues, value => {
        const { elementType, identity } = value || {}

        return elementType ? `${elementType}:${identity}` : identity
      })

      return memo(value)
    },
    [memoize, mapNeo4jValuesToPlainValues]
  )
  const mapped = mapper(value)

  if (Number.isInteger(value)) {
    return `${value}.0`
  }

  if (typeof mapped === 'string') {
    return `"${mapped}"`
  }

  if (isPoint(value)) {
    const pairs = filter(
      entries(mapped),
      ([, val]) => val !== null && val !== undefined
    )

    return `point({${join(
      map(pairs, pair => join(pair, ': ')),
      ', '
    )}})`
  }

  if (mapped && typeof mapped === 'object') {
    return (
      <StyledJsonPre
        dangerouslySetInnerHTML={{
          __html: convertUrlsToHrefTags(
            HTMLEntities(JSON.stringify(mapped, null, 2))
          )
        }}
      />
    )
  }

  return <ClickableUrls text={mapped} />
}

export function RelatableBodyMessage({ maxRows, result }) {
  const { bodyMessage } = getBodyAndStatusBarMessages(result, maxRows)

  return (
    <StyledStatsBar>
      <Ellipsis>{bodyMessage}</Ellipsis>
    </StyledStatsBar>
  )
}

export const RelatableStatusbar = connect(state => ({
  maxRows: getMaxRows(state),
  maxFieldItems: getMaxFieldItems(state)
}))(RelatableStatusbarComponent)

export function RelatableStatusbarComponent({
  maxRows,
  result,
  maxFieldItems
}) {
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
      <Ellipsis>
        {hasTruncatedFields && (
          <StyledTruncatedMessage>
            <Icon name="warning sign" /> Record fields have been
            truncated.&nbsp;
          </StyledTruncatedMessage>
        )}
        {statusBarMessage}
      </Ellipsis>
    </StyledStatsBar>
  )
}
