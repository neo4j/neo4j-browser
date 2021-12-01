function checkInvalidActionTypeInArray(arg: string, idx: number): void | never {
  if (!arg) {
    throw new Error(
      `Argument contains array with empty element at index ${idx}`
    )
  } else if (typeof arg !== 'string' && typeof arg !== 'symbol') {
    throw new Error(
      `Argument contains array with invalid element at index ${idx}, it should be of type: string | symbol`
    )
  }
}

/**
 * @description (curried assert function) check if action type is equal given type-constant
 * @description it works with discriminated union types
 */
export function isOfType<T extends string, A extends { type: string }>(
  type: T | T[],
  action: A
): action is A extends { type: T } ? A : never

/**
 * @description (curried assert function) check if action type is equal given type-constant
 * @description it works with discriminated union types
 */
export function isOfType<T extends string>(
  type: T | T[]
): <A extends { type: string }>(
  action: A
) => action is A extends { type: T } ? A : never

export function isOfType<T extends string, A extends { type: T }>(
  actionTypeOrTypes: T | T[],
  action?: A
): unknown {
  if (!actionTypeOrTypes) {
    throw new Error(`Argument 1 is empty.`)
  }

  const actionTypes = Array.isArray(actionTypeOrTypes)
    ? actionTypeOrTypes
    : [actionTypeOrTypes]

  actionTypes.forEach(checkInvalidActionTypeInArray)

  const assertFn = (_action: A) => actionTypes.includes(_action.type)

  // 1 arg case => return curried version
  if (action === undefined) {
    return assertFn
  }
  // 2 args case => invoke assertFn and return the result
  return assertFn(action)
}
