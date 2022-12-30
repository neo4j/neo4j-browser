import { SpinnerIcon } from 'browser-components/icons/LegacyIcons'
import { hasReachableServer, Neo4jError } from 'neo4j-driver'
import React, { useEffect, useState } from 'react'
import { stripScheme } from 'services/boltscheme.utils'
import { isValidUrl } from 'shared/modules/commands/helpers/http'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import { httpReachabilityCheck, HttpReachablityState } from './Auth/ConnectForm'
import { StyledConnectionTextInput } from './Auth/styled'
import { BaseFrameProps } from './Stream'

httpReachabilityCheck
/*  Detectable Edgecases

Entering 7474
SSL + bare IP 
Pausad neo4j aura
*/

/* Docs
- Websockets krävs. Discovery API krävs inte men bra för debugging.
- Länk om self signed certs
- Länk om let's encrypt
- Mixing secure/unsecure generally does not work
*/

// always

// Check if we found the HTTP connector

/* TODO
- e2e tests

*/
async function boltReachabilityCheck(url: string, secure: boolean) {
  try {
    //const url2 = url.split('+s').join()
    // Explicitly turn on/off encryption
    await hasReachableServer(url, {
      encrypted: secure //url.startsWith('+s') ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF'
    })
    return true
  } catch (e) {
    console.log(e)
    return e as Neo4jError
  }
}

// Hantera https browser försöker ansluta till lokal grej...
// Testa om kan göra en websocket och sen först.

// TODO fråga om problematiskt att öppna ws
// TODO fråga om det gör någon skillnad med bolt:// vs neo4j://
// TODO jag är på HTTPs och försöker göra hasReachableServer(bolt://) men min websocket blir uppgraderad. hur kan jag upptäcka?
// TODO Kolla så det inte börjar kasta oväntat i https elller så. Testing Matrix.

const protocols = ['bolt://', 'bolt+s://'] as const
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

  const [wsReachable, setWsReachable] = useState<boolean | undefined>()
  const [wssReachable, setWssReachable] = useState<boolean | undefined>()
  // TODO kolla 7687 grejern för includes inte superän

  // TOdo man man explicit slå på conn
  const [boltReachabilty, setBoltReachablity] = useState<
    'loading' | Record<string, true | Neo4jError>
  >('loading')
  useEffect(() => {
    try {
      const hostname = stripScheme(debugUrl)
      if (isValidUrl(`http://${hostname}`)) {
        /*
        // TODO timea ut också
        const ws = new WebSocket(`ws://${hostname}`)
        ws.onclose = e => {
          setWsReachable(e.wasClean)
        }
        ws.onopen = () => ws.close()

        const wss = new WebSocket(`wss://${hostname}`)
        wss.onclose = e => {
          setWssReachable(e.wasClean)
        }
        wss.onopen = () => wss.close()
        */

        setBoltReachablity('loading')
        Promise.all(
          protocols.map(protocol =>
            boltReachabilityCheck(
              'bolt://' + hostname,
              protocol === 'bolt+s://'
            )
          )
        ).then(results =>
          setBoltReachablity(
            results.reduce(
              (acc, curr, index) => ({ ...acc, [protocols[index]]: curr }),
              {}
            )
          )
        )

        httpReachabilityCheck(`https://${hostname}`).then(setHttpsReachable)
        httpReachabilityCheck(`http://${hostname}`).then(setHttpReachable)
      }
    } catch (e) {
      console.log(e)
    }
  }, [debugUrl])

  const validUrl = isValidUrl(`http://${stripScheme(debugUrl)}`)
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
          <div> {!validUrl && 'invalid URL format'} </div>
          <div> Discover Api over HTTP status: {httpReachable} </div>
          <div> Discover Api over HTTPS status: {httpsReachable} </div>
          <div> wsReachable {wsReachable ? 'yes' : 'no'}</div>
          <div> wssReachable {wssReachable ? 'yes' : 'no'}</div>
          {boltReachabilty === 'loading' ? (
            <SpinnerIcon />
          ) : (
            protocols.map(p => {
              const res = boltReachabilty[p]
              return (
                <div key={p}>
                  {p} {'->'} {res === true ? 'Reached' : res.code}{' '}
                </div>
              )
            })
          )}
        </div>
      }
    />
  )
}
export default DebugConnectivityFrame
