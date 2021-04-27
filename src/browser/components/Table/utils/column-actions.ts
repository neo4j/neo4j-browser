import { some } from 'lodash-es'

import { RelatableAction } from '../relatable.types'

import arrayHasItems from './array-has-items'

export function columnHasActions(
  column: any,
  availableActions: RelatableAction[]
): boolean {
  return (
    arrayHasItems(availableActions) &&
    some(availableActions, action => columnHasAction(column, action))
  )
}

export function columnHasAction(column: any, action: RelatableAction): boolean {
  const [, predicate] = action

  return predicate(column)
}
