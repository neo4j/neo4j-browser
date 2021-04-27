import React, { useMemo } from 'react'
import { flatMap } from 'lodash-es'

import { RowProps } from './index'

import { useRelatableStateContext } from '../../states'
import getFinalDepthSubRows from '../../utils/get-final-depth-subrows'

import Relatable from '../relatable/relatable'

export default function ExpandedRow({ row }: RowProps): JSX.Element {
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
