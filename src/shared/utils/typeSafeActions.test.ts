import { isOfType } from './typeSafeActions'

const types = {
  // String Literal Types
  VERY_DEEP_WITH_TYPE_ONLY: 'VERY_DEEP_WITH_TYPE_ONLY',
  WITH_TYPE_ONLY: 'WITH_TYPE_ONLY',
  WITH_PAYLOAD: 'WITH_PAYLOAD',
  WITH_OPTIONAL_PAYLOAD: 'WITH_OPTIONAL_PAYLOAD',
  WITH_PAYLOAD_META: 'WITH_PAYLOAD_META',
  WITH_MAPPED_PAYLOAD: 'WITH_MAPPED_PAYLOAD',
  WITH_MAPPED_PAYLOAD_META: 'WITH_MAPPED_PAYLOAD_META'
}

const createAction = <P extends unknown, M extends unknown>(
  type: string,
  payload?: P,
  meta?: M
) => {
  const action = { type }
  if (payload) Object.assign(action, { payload })
  if (meta) Object.assign(action, { meta })
  return action
}

const actions = {
  withTypeOnly: createAction(types.WITH_TYPE_ONLY),
  withPayload: createAction(types.WITH_PAYLOAD, 2),
  withPayloadMeta: createAction(types.WITH_PAYLOAD_META, 2, 'metaValue'),
  withMappedPayload: createAction(types.WITH_MAPPED_PAYLOAD, 2),
  withMappedPayloadMeta: createAction(
    types.WITH_MAPPED_PAYLOAD_META,
    2,
    'metaValue'
  )
}

/** HELPERS */

const typeOnlyAction = actions.withTypeOnly
const typeOnlyExpected = { type: 'WITH_TYPE_ONLY' }
const payloadAction = actions.withPayload
const payloadExpected = { type: 'WITH_PAYLOAD', payload: 2 }
const payloadMetaAction = actions.withPayloadMeta
const payloadMetaExpected = {
  type: 'WITH_PAYLOAD_META',
  payload: 2,
  meta: 'metaValue'
}
const mappedPayloadAction = actions.withMappedPayload
const mappedPayloadExpected = { type: 'WITH_MAPPED_PAYLOAD', payload: 2 }
const mappedPayloadMetaAction = actions.withMappedPayloadMeta
const mappedPayloadMetaExpected = {
  type: 'WITH_MAPPED_PAYLOAD_META',
  payload: 2,
  meta: 'metaValue'
}

const $action = [
  typeOnlyAction,
  payloadAction,
  payloadMetaAction,
  mappedPayloadAction,
  mappedPayloadMetaAction
]

/** TESTS */
describe('isOfType', () => {
  it('should work with single action-type arg', () => {
    expect(isOfType(types.WITH_TYPE_ONLY)(typeOnlyAction)).toBe(true)
    expect(isOfType(types.WITH_TYPE_ONLY, typeOnlyAction)).toBe(true)
    expect(isOfType(types.WITH_TYPE_ONLY)(payloadAction)).toBe(false)
    expect(isOfType(types.WITH_TYPE_ONLY, payloadAction)).toBe(false)
    expect(isOfType([types.WITH_TYPE_ONLY])(typeOnlyAction)).toBe(true)
    expect(isOfType([types.WITH_TYPE_ONLY], typeOnlyAction)).toBe(true)
    expect(isOfType([types.WITH_TYPE_ONLY])(payloadAction)).toBe(false)
    expect(isOfType([types.WITH_TYPE_ONLY], payloadAction)).toBe(false)
  })

  it('should work with multiple action-type args', () => {
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD])(typeOnlyAction)
    ).toBe(true)
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD], typeOnlyAction)
    ).toBe(true)
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD])(payloadAction)
    ).toBe(true)
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD], payloadAction)
    ).toBe(true)
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD])(mappedPayloadAction)
    ).toBe(false)
    expect(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD], mappedPayloadAction)
    ).toBe(false)
  })

  it('should correctly assert for an array with 1 arg', () => {
    const actual = $action.filter(isOfType(types.WITH_TYPE_ONLY))
    expect(actual).toEqual([typeOnlyExpected])
  })

  it('should correctly assert for an array with 2 args', () => {
    const actual = $action.filter(
      isOfType([types.WITH_TYPE_ONLY, types.WITH_PAYLOAD])
    )
    expect(actual).toEqual([typeOnlyExpected, payloadExpected])
  })

  it('should correctly assert for an array with 3 args', () => {
    const actual = $action.filter(
      isOfType([
        types.WITH_TYPE_ONLY,
        types.WITH_PAYLOAD,
        types.WITH_PAYLOAD_META
      ])
    )
    expect(actual).toEqual([
      typeOnlyExpected,
      payloadExpected,
      payloadMetaExpected
    ])
  })

  it('should correctly assert for an array with 4 args', () => {
    const actual = $action.filter(
      isOfType([
        types.WITH_TYPE_ONLY,
        types.WITH_PAYLOAD,
        types.WITH_PAYLOAD_META,
        types.WITH_MAPPED_PAYLOAD
      ])
    )
    expect(actual).toEqual([
      typeOnlyExpected,
      payloadExpected,
      payloadMetaExpected,
      mappedPayloadExpected
    ])
  })

  it('should correctly assert for an array with 4 args', () => {
    const actual = $action.filter(
      isOfType([
        types.WITH_TYPE_ONLY,
        types.WITH_PAYLOAD,
        types.WITH_PAYLOAD_META,
        types.WITH_MAPPED_PAYLOAD,
        types.WITH_MAPPED_PAYLOAD_META
      ])
    )
    expect(actual).toEqual([
      typeOnlyExpected,
      payloadExpected,
      payloadMetaExpected,
      mappedPayloadExpected,
      mappedPayloadMetaExpected
    ])
  })

  it('should correctly assert type with "any" action', () => {
    const action: any = createAction(types.WITH_MAPPED_PAYLOAD, 1234)
    if (
      isOfType(
        [types.WITH_MAPPED_PAYLOAD, types.WITH_MAPPED_PAYLOAD_META],
        action
      )
    ) {
      expect(action).toEqual({ payload: 1234, type: 'WITH_MAPPED_PAYLOAD' })
    }
    if (
      isOfType([types.WITH_MAPPED_PAYLOAD, types.WITH_MAPPED_PAYLOAD_META])(
        action
      )
    ) {
      expect(action).toEqual({ payload: 1234, type: 'WITH_MAPPED_PAYLOAD' })
    }
  })
})
