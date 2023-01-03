/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { SpinnerIcon } from 'browser-components/icons/LegacyIcons'
import { Neo4jError } from 'neo4j-driver'
import React, { useEffect, useState } from 'react'
import { stripScheme } from 'services/boltscheme.utils'
import { isValidUrl } from 'shared/modules/commands/helpers/http'
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
- duplication/reabability

Testing matrix:
Version: 3.5 4.4 5
Edition: Community Enterpise
Environment: Aura Standalone Cluster
Hosting: HTTP vs HTTPS
Bolt Security: Bolt vs Bolt+s
Target: 7474, 7687, 8080, 3423, random string
*/

function toHttp(url: string) {
  const hostname = stripScheme(url)
  return `http://${hostname}`
}

function toHttps(url: string) {
  const hostname = stripScheme(url)
  return `https://${hostname}`
}

function removeSecureScheme(url: string) {
  const [scheme, ...rest] = url.split('+s')
  return [scheme, ...rest].join('')
}

type BoltReachabilty =
  | { status: 'not_started' }
  | { status: 'loading' }
  | { status: 'succeeded' }
  | { status: 'error'; error: Neo4jError }

const DebugConnectivityFrame = (props: BaseFrameProps) => {
  const [debugUrl, setDebugUrl] = useState(props.frame.urlToDebug ?? '')

  useEffect(() => {
    setDebugUrl(props.frame.urlToDebug ?? '')
  }, [props.frame.urlToDebug])

  const [httpReachable, setHttpReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })
  const [httpsReachable, setHttpsReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })

  const [boltReachabilty, setBoltReachablity] = useState<BoltReachabilty>({
    status: 'not_started'
  })

  const [secureBoltReachability, setSecureBoltReachability] =
    useState<BoltReachabilty>({ status: 'not_started' })

  const [error, setError] = useState<string>()

  useEffect(() => {
    try {
      setError(undefined)
      const validUrl = isValidUrl(toHttp(debugUrl))
      const rightScheme =
        debugUrl.startsWith('neo4j') || debugUrl.startsWith('bolt')

      if (validUrl && rightScheme) {
        setBoltReachablity({ status: 'loading' })
        boltReachabilityCheck(removeSecureScheme(debugUrl), false).then(r => {
          if (r === true) {
            setBoltReachablity({ status: 'succeeded' })
          } else {
            setBoltReachablity({ status: 'error', error: r })
          }
        })

        setSecureBoltReachability({ status: 'loading' })
        boltReachabilityCheck(removeSecureScheme(debugUrl), true).then(r => {
          if (r === true) {
            setSecureBoltReachability({ status: 'succeeded' })
          } else {
            setSecureBoltReachability({ status: 'error', error: r })
          }
        })

        setHttpReachable({ status: 'loading' })
        httpReachabilityCheck(toHttp(debugUrl)).then(setHttpReachable)

        setHttpsReachable({ status: 'loading' })
        httpReachabilityCheck(toHttps(debugUrl)).then(setHttpsReachable)
      } else {
        setError('Invalid url, must be bolt:// or neo4j://')
      }
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Something went wrong')
      }
    }
  }, [debugUrl])

  const isAura = debugUrl.includes('neo4j.io')

  const unreachableAuraInstance =
    isAura && secureBoltReachability.status === 'error'

  const advertisedAdress =
    httpReachable.status === 'foundAdvertisedBoltAdress'
      ? httpReachable.advertisedAdress
      : httpsReachable.status === 'foundAdvertisedBoltAdress' &&
        httpsReachable.advertisedAdress

  const foundHTTPConnector =
    advertisedAdress && stripScheme(advertisedAdress) !== stripScheme(debugUrl)

  const isSecurelyHosted = (window?.location?.protocol ?? '')
    .toLowerCase()
    .includes('https')

  const onlyReachableOnBolt =
    boltReachabilty.status === 'succeeded' &&
    secureBoltReachability.status === 'error'

  const mixedSecurityWarning =
    (isSecurelyHosted && onlyReachableOnBolt) ||
    (!isSecurelyHosted && secureBoltReachability.status === 'succeeded')

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
          {foundHTTPConnector && <div> </div>}
          {mixedSecurityWarning && 'mixedSecurityWarning'}
          {foundHTTPConnector && 'foundHTTPConnector'}
          {unreachableAuraInstance && 'unreachableAuraInstance'}
          {error && <div> {error} </div>}
          <div>
            GET {toHttp(debugUrl)}: {httpReachable.status}{' '}
          </div>
          <div>
            GET {toHttps(debugUrl)}: {httpsReachable.status}{' '}
          </div>
          <div>
            {boltReachabilty.status !== 'not_started' && 'bolt handshake -> '}
            {boltReachabilty.status === 'loading' && <SpinnerIcon />}
            {boltReachabilty.status === 'succeeded' && 'Reached'}
            {boltReachabilty.status === 'error' &&
              boltReachabilty.error.message}
          </div>
          <div>
            {boltReachabilty.status !== 'not_started' &&
              'secure bolt handshake -> '}
            {secureBoltReachability.status === 'loading' && <SpinnerIcon />}
            {secureBoltReachability.status === 'succeeded' && 'Reached'}
            {secureBoltReachability.status === 'error' &&
              secureBoltReachability.error.message}
          </div>
        </div>
      }
    />
  )
}
export default DebugConnectivityFrame
