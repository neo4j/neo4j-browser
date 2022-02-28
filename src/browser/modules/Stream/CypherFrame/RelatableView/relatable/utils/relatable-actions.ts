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
import { filter, find, map, some } from 'lodash-es'

import { RelatableAction, TableAddOnReturn } from '../relatable.types'

export function getRelatableGlobalActions(
  addOns: TableAddOnReturn[]
): RelatableAction[] {
  return map(
    filter(addOns, ([name]) => Boolean(name)),
    ([name, , predicate]): RelatableAction => [name!, predicate]
  )
}

export function getRelatableTableActions(
  addOns: TableAddOnReturn[]
): RelatableAction[] {
  return map(
    filter(addOns, ([, name]) => Boolean(name)),
    ([, name, predicate]): RelatableAction => [name!, predicate]
  )
}

export function getRelatableAction(
  actions: RelatableAction[],
  name: string
): RelatableAction | undefined {
  return find(actions, ([actionName]) => actionName === name)
}

export function isActionAvailable(
  availableActions: RelatableAction[],
  name: string
): boolean {
  return some(availableActions, ([actionName]) => actionName === name)
}
