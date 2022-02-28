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
import { flatMap } from 'lodash-es'
import React, { useMemo } from 'react'

import { useRelatableStateContext } from '../../states'
import getFinalDepthSubRows from '../../utils/get-final-depth-subrows'
import Relatable from '../relatable/relatable'
import { IRowProps } from './index'

export default function ExpandedRow({ row }: IRowProps): JSX.Element {
  const { _originalColumns } = useRelatableStateContext()
  const data = useMemo(() => flatMap(row.subRows, getFinalDepthSubRows), [row])

  return (
    <Relatable
      className="relatable__expanded-row-table"
      compact
      columns={_originalColumns}
      data={data}
    />
  )
}
