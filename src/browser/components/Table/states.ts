import { createContext, Dispatch, useContext } from 'react'

import {
  RelatableStateInstance,
  ToolbarAction,
  ToolbarActionDispatch
} from './relatable.types'

export const RelatableStateContext = createContext<any>([{}, () => null])
export const useRelatableStateContext = <
  Data extends object = any,
  IInstance extends RelatableStateInstance = RelatableStateInstance<Data>
>(): IInstance => useContext(RelatableStateContext)
export const RelatableActionContext = createContext<
  [ToolbarAction | null, ToolbarActionDispatch, Dispatch<void>]
>([
  null,
  () => ({
    name: 'NOOP',
    column: {}
  }),
  () => null
])
export const useRelatableToolbarContext = () =>
  useContext(RelatableActionContext)
