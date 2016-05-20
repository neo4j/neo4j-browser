import * as t from './actionTypes'

function updateMeta (meta) {
  return {
    type: t.UPDATE_META,
    state: {meta: meta}
  }
}

export {
  updateMeta
}
