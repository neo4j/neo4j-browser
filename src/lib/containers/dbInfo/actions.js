import * as t from './actionTypes'

function updateMeta (meta, context) {
  return {
    type: t.UPDATE_META,
    meta,
    context
  }
}

export {
  updateMeta
}
