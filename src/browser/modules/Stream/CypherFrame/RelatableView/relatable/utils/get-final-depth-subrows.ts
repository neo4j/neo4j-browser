import { flatMap } from 'lodash-es'

import arrayHasItems from './array-has-items'

export default function getFinalDepthSubRows(row: any): any[] {
  const { subRows = [] } = row

  if (arrayHasItems(subRows)) {
    return flatMap(subRows, getFinalDepthSubRows)
  }

  return [row.values]
}
