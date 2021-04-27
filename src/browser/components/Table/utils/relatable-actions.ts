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
