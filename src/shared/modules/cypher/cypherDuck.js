import Rx from 'rxjs'

import bolt from 'services/bolt/bolt'

const NAME = 'cypher'
export const CYPHER_REQUEST = NAME + '/REQUEST'

export const cypherRequestEpic = (some$, store) =>
  some$.ofType(CYPHER_REQUEST)
    .mergeMap((action) => {
      if (!action._responseChannel) return Rx.Observable.of(null)
      return bolt.transaction(action.query)
        .then((r) => ({type: action._responseChannel, success: true, result: r}))
        .catch((e) => ({type: action._responseChannel, success: false, error: e}))
    })
