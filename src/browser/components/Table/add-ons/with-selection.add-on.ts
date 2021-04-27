import { useCallback, useMemo, useState } from 'react'
import {
  useRowSelect,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectState
} from 'react-table'
import { map, values, flatMap, reduce, assign, omit } from 'lodash-es'

import {
  RelatableStateInstance,
  SelectSetter,
  TableAddOnReturn
} from '../relatable.types'
import arrayHasItems from '../utils/array-has-items'

export interface WithSelectionOptions<Data extends object = any>
  extends UseRowSelectOptions<Data> {
  onSelectionChange?: SelectSetter<Data>

  // react-table state override https://react-table.js.org/api/useRowSelect
  selectedRowIds?: { [id: string]: boolean }
}

export type WithSelectionState<Data extends object = any> = UseRowSelectState<
  Data
>

export interface WithSelectionInstance<Data extends object = any>
  extends UseRowSelectInstanceProps<Data>,
    RelatableStateInstance<Data, WithSelectionState<Data>> {
  onCustomSelectionChange: SelectSetter<Data>
}

export default function withSelection<Data extends object = any>(
  options: WithSelectionOptions<Data> = {}
): TableAddOnReturn {
  const {
    selectedRowIds: theirSelectedRowIds,
    onSelectionChange,
    ...tableParams
  } = options
  const [ourSelectedRowIds, setOurSelectedRowIds] = useState<{
    [id: string]: boolean
  }>({})
  const selectedRowIds = theirSelectedRowIds || ourSelectedRowIds
  const stateParams = { selectedRowIds }
  const onCustomSelectionChange: SelectSetter = useCallback(
    (rows, select) => {
      if (onSelectionChange) {
        onSelectionChange(rows, select)

        return
      }

      const newIds = flatMap(rows, ({ id, subRows }) =>
        arrayHasItems(subRows) ? map(subRows, subRow => subRow.id) : [id]
      )

      if (select) {
        setOurSelectedRowIds(
          reduce(newIds, (agg, id) => assign(agg, { [id]: true }), {
            ...selectedRowIds
          })
        )

        return
      }

      setOurSelectedRowIds(omit(selectedRowIds, newIds))
    },
    [onSelectionChange, selectedRowIds]
  )

  return [
    withSelection.name,
    null,
    () => true,
    () =>
      useMemo(
        (): Partial<WithSelectionInstance> => ({
          ...tableParams,
          onCustomSelectionChange
        }),
        [onCustomSelectionChange, ...values(tableParams)]
      ),
    () => useMemo(() => stateParams, [selectedRowIds]),
    useRowSelect
  ]
}
