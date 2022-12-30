import { SpinnerIcon } from 'browser-components/icons/LegacyIcons'
import { Neo4jError } from 'neo4j-driver'
import React, { useEffect, useState } from 'react'
import { stripScheme } from 'services/boltscheme.utils'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import {
  boltReachabilityCheck,
  httpReachabilityCheck,
  HttpReachablityState
} from './Auth/ConnectForm'
import { StyledConnectionTextInput } from './Auth/styled'
import { BaseFrameProps } from './Stream'

httpReachabilityCheck
/*  Detectable Edgecases
SSL + bare IP
Pausad neo4j aura
Check if we found the HTTP connector
*/

/* Docs
- Websockets krävs. Discovery API krävs inte men bra för debugging.
- Länk om self signed certs
- Länk om let's encrypt
- Mixing secure/unsecure generally does not work
*/

/* TODO
- e2e tests
- Kolla så det inte börjar kasta oväntat i https elller så. Testing Matrix.
- fråga om det gör någon skillnad med bolt:// vs neo4j:// & nämn att jag sätter explicit
*/

const DebugConnectivityFrame = (props: BaseFrameProps) => {
  const [debugUrl, setDebugUrl] = useState(
    stripScheme(props.frame.urlToDebug ?? '')
  )

  useEffect(() => {
    setDebugUrl(props.frame.urlToDebug ?? '')
  }, [props.frame.urlToDebug])

  const [httpReachable, setHttpReachable] =
    useState<HttpReachablityState>('noRequest')

  const [httpsReachable, setHttpsReachable] = useState<HttpReachablityState>()

  const [boltReachabilty, setBoltReachablity] = useState<
    'loading' | true | Neo4jError
  >('loading')

  const [secureBoltReachability, setSecureBoltReachability] = useState<
    'loading' | true | Neo4jError
  >('loading')

  useEffect(() => {
    try {
      const hostname = stripScheme(debugUrl)

      setBoltReachablity('loading')
      boltReachabilityCheck('bolt://' + hostname, false).then(
        setBoltReachablity
      )
      setSecureBoltReachability('loading')
      boltReachabilityCheck('bolt://' + hostname, true).then(
        setSecureBoltReachability
      )

      httpReachabilityCheck(`http://${hostname}`).then(setHttpReachable)
      httpReachabilityCheck(`https://${hostname}`).then(setHttpsReachable)
    } catch (e) {
      console.log('Something went wrong when checking reachability', e)
    }
  }, [debugUrl])

  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      contents={
        <div>
          <div style={{ marginBottom: '10px' }}>
            Browser hosted on:{' '}
            <pre style={{ display: 'inline' }}>{window.location.protocol}</pre>{' '}
          </div>
          <label>
            Connect URL
            <StyledConnectionTextInput
              value={debugUrl}
              onChange={e => setDebugUrl(e.target.value)}
            />
          </label>

          <div> Discover Api over HTTP status: {httpReachable} </div>

          <div> Discover Api over HTTPS status: {httpsReachable} </div>

          {boltReachabilty === 'loading' ? (
            <SpinnerIcon />
          ) : (
            <div>
              {'bolt:// -> '}{' '}
              {boltReachabilty === true ? 'Reached' : boltReachabilty.code}{' '}
            </div>
          )}

          {secureBoltReachability === 'loading' ? (
            <SpinnerIcon />
          ) : (
            <div>
              {'bolt+s:// -> '}{' '}
              {secureBoltReachability === true
                ? 'Reached'
                : secureBoltReachability.code}{' '}
            </div>
          )}
        </div>
      }
    />
  )
}
export default DebugConnectivityFrame
