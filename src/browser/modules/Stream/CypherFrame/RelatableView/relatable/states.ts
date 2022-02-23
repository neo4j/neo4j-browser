import { Dispatch, createContext, useContext } from 'react'

import {
  IRelatableStateInstance,
  ToolbarAction,
  ToolbarActionDispatch
} from './relatable.types'

export const RelatableStateContext = createContext<any>([{}, () => null])
export const useRelatableStateContext = <
  Data extends object = any,
  IInstance extends IRelatableStateInstance = IRelatableStateInstance<Data>
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
