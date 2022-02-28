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
