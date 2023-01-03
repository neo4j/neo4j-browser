import { SpinnerIcon } from 'browser-components/icons/LegacyIcons'
import { Neo4jError } from 'neo4j-driver'
import React, { useEffect, useState } from 'react'
import { stripScheme } from 'services/boltscheme.utils'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import {
  boltReachabilityCheck,
  httpReachabilityCheck,
  HttpReachablity
} from './Auth/ConnectForm'
import { StyledConnectionTextInput } from './Auth/styled'
import { BaseFrameProps } from './Stream'

/* Docs
- Websockets krävs. Discovery API krävs inte men bra för debugging.
- Länk om self signed certs
- Länk om let's encrypt
*/

/* TODO
- e2e tests

Testing matrix:
Version: 3.5 4.4 5
Edition: Community Enterpise
Environment: Aura Standalone Cluster
Hosting: HTTP vs HTTPS
Bolt Security: Bolt vs Bolt+s
*/

const DebugConnectivityFrame = (props: BaseFrameProps) => {
  const [debugUrl, setDebugUrl] = useState(
    stripScheme(props.frame.urlToDebug ?? '')
  )

  useEffect(() => {
    setDebugUrl(props.frame.urlToDebug ?? '')
  }, [props.frame.urlToDebug])

  const [httpReachable, setHttpReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })
  const [httpsReachable, setHttpsReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })

  const [boltReachabilty, setBoltReachablity] = useState<
    'loading' | true | Neo4jError
  >('loading')

  const [secureBoltReachability, setSecureBoltReachability] = useState<
    'loading' | true | Neo4jError
  >('loading')

  useEffect(() => {
    try {
      const hostname = stripScheme(debugUrl)

      // TODO match protocol
      setBoltReachablity('loading')
      boltReachabilityCheck('bolt://' + hostname, false).then(
        setBoltReachablity
      )

      // TODO match protocol
      setSecureBoltReachability('loading')
      boltReachabilityCheck('bolt://' + hostname, true).then(
        setSecureBoltReachability
      )

      setHttpReachable({ status: 'loading' })
      httpReachabilityCheck(`http://${hostname}`).then(setHttpReachable)

      setHttpsReachable({ status: 'loading' })
      httpReachabilityCheck(`https://${hostname}`).then(setHttpsReachable)
    } catch (e) {
      console.log('Something went wrong when checking reachability', e)
    }
  }, [debugUrl])

  const mixedSecurityWarning = false
  const unreachableAuraInstance = false
  const foundHTTPConnector = false
  const isSecurelyHosted = false

  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      contents={
        <div>
          Browser connects to the Neo4j Server through websocket via the bolt://
          protocol on the bolt connector port. This port also responds to HTTP
          requests with limited server information.
          <label>
            Connect URL
            <StyledConnectionTextInput
              value={debugUrl}
              onChange={e => setDebugUrl(e.target.value)}
            />
          </label>
          {isSecurelyHosted && (
            <div>
              When browser is hosted on HTTPS a secure connection to neo4j to
              neo4j is required. Therefore only the secure protocols bolt+s://
              and neo4j+s:// are enabled when Browser is hosted on HTTPS.
              Setting up SSL can be tricky to get right, here is a link to a
              knowledgebase article to help
            </div>
          )}
          <div> Discover Api over HTTP status: {httpReachable} </div>
          <div> Discover Api over HTTPS status: {httpsReachable} </div>
          {boltReachabilty === 'loading' ? (
            <SpinnerIcon />
          ) : (
            <div>
              {'bolt handshake -> '}{' '}
              {boltReachabilty === true ? 'Reached' : boltReachabilty.code}{' '}
            </div>
          )}
          {secureBoltReachability === 'loading' ? (
            <SpinnerIcon />
          ) : (
            <div>
              {'secure bolt handshake -> '}{' '}
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
