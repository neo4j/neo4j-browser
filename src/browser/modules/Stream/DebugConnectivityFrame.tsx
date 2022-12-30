import { hasReachableServer } from 'neo4j-driver'
import React, { useEffect, useState } from 'react'
import { stripScheme } from 'services/boltscheme.utils'
import { BaseFrameProps } from './Stream'

const DebugConnectivityFrame = (props: BaseFrameProps) => {
  // TODO If you're struggling with setting up certs -> link!

  // TODO check for neo4j at default ports?

  // TODO skriv med text att man behöver ha en websocket connection till neo4j för att fungera

  // TODO om de använder SSL === make sure not writing IP? för det måste vara en domän

  // TODO Aura instans -> Hur beter sig om den är pausad?

  // TODO mention +SSC not working in browser. If you use self signed cert -> link.
  const [debugUrl, setDebugUrl] = useState(
    stripScheme(props.frame.urlToDebug ?? '')
  )
  console.log(props.frame.urlToDebug, debugUrl)
  useEffect(() => {
    setDebugUrl(props.frame.urlToDebug ?? '')
  }, [props.frame.urlToDebug])

  // I denna HTTP checken -> ge felet CORS === förmodligne inget där

  // if neo4j is reachable. but you still get an odd websocket error -> what could be wrong? misconfigured SSL
  // grå ut men låta en göra det ändå?

  useEffect(() => {
    // TODO e2e tests
    // kolla http vs https också
    // TODO check that is valid URL
    fetch(`https://${debugUrl}`)
      .then(res => res.json())
      .then(r => {
        if ('auth_config' in r && 'oidc_providers' in r.auth_config) {
          console.log('success')
        } else {
          console.log('fail')
        }
      })
      .catch(e => console.log(e.cause))

    fetch(`http://${debugUrl}`)
      .then(res => res.json())
      .then(r => {
        if ('auth_config' in r && 'oidc_providers' in r.auth_config) {
          console.log('success')
        } else {
          console.log('fail')
        }
      })
      .catch(e => console.log(e.cause))

    /*
    hasReachableServer(`bolt://${debugUrl}`)
      .then(console.log)
      .catch(e => console.log(e.cause))
      */

    hasReachableServer(`neo4j://${debugUrl}`)
      .then(console.log)
      .catch(e => console.log(e.cause))

    /*
    hasReachableServer(`bolt+s://${debugUrl}`)
      .then(console.log)
      .catch(e => console.log(e.cause))

    hasReachableServer(`neo4j+s://${debugUrl}`)
      .then(console.log)
      .catch(e => console.log(e.cause))
      */
  }, [debugUrl])

  return (
    <div>
      <h6>
        Neo4j Browser communicates with Neo4j Server via websocket over the
        bolt:// protocol by default done on port 7688. This{' '}
      </h6>
      <label>
        Connect URL
        <input value={debugUrl} onChange={e => setDebugUrl(e.target.value)} />
      </label>
    </div>
  )
}
export default DebugConnectivityFrame
