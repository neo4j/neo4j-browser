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
