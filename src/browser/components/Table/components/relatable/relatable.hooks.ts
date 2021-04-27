import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react'
import { TableOptions, useTable } from 'react-table'
import { assign, map, pick, reduce, values, filter, keys } from 'lodash-es'

import {
  RelatableStateInstance,
  StateChangeHandler,
  ToolbarAction,
  ToolbarActionDispatch
} from '../../relatable.types'
import { RelatableProps } from './relatable'

import { ON_STATE_CHANGE_TRIGGERS } from '../../constants'
import getRelatableAddOns from '../../utils/get-relatable-add-ons'
import {
  getRelatableGlobalActions,
  getRelatableTableActions
} from '../../utils/relatable-actions'

import { TextCell } from '../renderers'

export function useRelatableActions(): [
  ToolbarAction | null,
  ToolbarActionDispatch,
  Dispatch<void>
] {
  const [action, setAction] = useState<ToolbarAction | null>(null)
  const clearAction = useCallback(() => setAction(null), [setAction])
  const setToolbarAction = useCallback(
    (name, column) =>
      setAction({
        name,
        column
      }),
    [setAction]
  )

  return [action, setToolbarAction, clearAction]
}

// always memoize...
const getCellColSpanDefault = () => undefined
const DEFAULT_COLUMN = {}

export function useRelatableState<
  Data extends object = any,
  IInstance extends RelatableStateInstance = RelatableStateInstance<Data>
>(props: RelatableProps<Data>): RelatableStateInstance<Data> {
  const {
    columns,
    data,
    onStateChange,
    defaultColumn = DEFAULT_COLUMN,
    getCellColSpan = getCellColSpanDefault
  } = props

  // prepare add-ons and extract return values
  const addOns = getRelatableAddOns(props)
  const availableGlobalActions = getRelatableGlobalActions(addOns)
  const availableTableActions = getRelatableTableActions(addOns)
  const tableParamFactories = map(addOns, prep => prep[3])
  const tableStateFactories = map(addOns, prep => prep[4])
  const reactTableHooks = map(addOns, prep => prep[5])

  // prepare table params and context values
  const stateParams = reduce(
    tableStateFactories,
    (agg, fac) => assign(agg, fac(agg) || {}),
    {}
  )
  // @ts-ignore
  const tableParams: TableOptions<Data> = reduce(
    tableParamFactories,
    // @ts-ignore
    (agg, fac) => assign(agg, fac(agg) || {}),
    {
      columns,
      data,
      state: stateParams,
      getCustomCellColSpan: getCellColSpan,
      useControlledState: (state: any) =>
        useMemo(() => assign({}, state, stateParams), [
          state,
          values(stateParams)
        ]),
      defaultColumn: useMemo(
        () => ({
          Cell: TextCell,
          ...defaultColumn
        }),
        [defaultColumn]
      )
    }
  )
  const contextValue = useTable<Data>(tableParams, ...reactTableHooks)

  // add additional values for context
  const added = {
    ...contextValue,
    availableGlobalActions,
    availableTableActions,
    // @todo: cleanup
    _originalColumns: columns,
    // @todo: figure out a cleaner way of detecting and passing rows to use based on addOns used
    // @ts-ignore
    _rowsToUse: contextValue.page || contextValue.rows
  } as IInstance

  // hoist and override react-table state
  useOnStateChange(added, onStateChange)

  return added
}

export function useOnStateChange<
  Data extends object = any,
  IInstance extends RelatableStateInstance = RelatableStateInstance<Data>
>({ state: tableState }: IInstance, onStateChange?: StateChangeHandler) {
  const toOutside = pick(tableState, ON_STATE_CHANGE_TRIGGERS)
  const [oldState, setOldState] = useState(toOutside)

  // callback
  useEffect(() => {
    if (!onStateChange) return

    const changedKeys = filter(
      keys(toOutside),
      key => toOutside[key] !== oldState[key]
    )

    setOldState(toOutside)
    onStateChange(toOutside, changedKeys)
  }, [onStateChange, ...values(toOutside)]) // spread to prevent double trigger
}
