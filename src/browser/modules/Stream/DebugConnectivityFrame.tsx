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

/* TODO
- e2e tests
- duplication/reabability
- TODO messaging is bad
- TODO look over wording - encrypted ist för secure

Testing matrix:
Version: 3.5 4.4 5
Edition: Community Enterpise
Environment: Aura Standalone Cluster
Hosting: HTTP vs HTTPS
Bolt Security: Bolt vs Bolt+s
Target: 7474, 7687, 8080, 3423, random string, aura paused
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

  const advertisedAddress =
    httpReachable.status === 'foundAdvertisedBoltAddress'
      ? httpReachable.advertisedAddress
      : httpsReachable.status === 'foundAdvertisedBoltAddress' &&
        httpsReachable.advertisedAddress

  const isSecurelyHosted = (window?.location?.protocol ?? '')
    .toLowerCase()
    .includes('https')

  const onlyReachableOnBolt =
    boltReachabilty.status === 'succeeded' &&
    secureBoltReachability.status === 'error'

  const secureHostingUnsecureBolt = isSecurelyHosted && onlyReachableOnBolt

  const unsecureHostingSecureBolt =
    !isSecurelyHosted && secureBoltReachability.status === 'succeeded'

  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      contents={
        <div>
          Browser connects to the Neo4j Server over a websocket connection via
          the bolt:// protocol on the bolt connector port. This port only
          supports cypher queries via websocket connection but does responds to
          HTTP GET requests with limited server information.
          <label>
            Connect URL
            <StyledConnectionTextInput
              value={debugUrl}
              onChange={e => setDebugUrl(e.target.value)}
            />
          </label>
          {(secureHostingUnsecureBolt || unsecureHostingSecureBolt) && (
            <div>
              When browser is hosted on HTTPS an encrypted connection (bolt+s://
              or neo4j+s://) to neo4j is required and conversely when it is
              hosted on HTTP it needs an unencrypted connection (bolt:// or
              neo4j://). A mismatch has been detected
              {secureHostingUnsecureBolt &&
                'Neo4j Browser is hosted on https, but only an an unencrypted bolt connector was detected. To connect you will either need to configure a bolt SSL on the server or switch to HTTP hosting of browser'}
              {unsecureHostingSecureBolt &&
                'Neo4j Browser is hosted on http, but only an an encrypted bolt connector was detected. To connect you will either need to configure https hosting of browser, use the centrally hosted browser neo4j has set up for you https://browser.neo4j.io or disable bolt encryption on on the server.'}
            </div>
          )}
          {isSecurelyHosted && (
            <div>
              When browser is hosted on HTTPS a secure connection to neo4j to
              neo4j is required. Therefore only the secure protocols bolt+s://
              and neo4j+s:// are enabled when Browser is hosted on HTTPS.
              Setting up SSL can be tricky to get right, here is a link to a
              knowledgebase article to help.
            </div>
          )}
          {advertisedAddress &&
            stripScheme(advertisedAddress) !== stripScheme(debugUrl) && (
              <div>
                The neo4j server we reached advertised its bolt connector at
                <a onClick={() => setDebugUrl(advertisedAddress)}>
                  ({advertisedAddress}), try that instead?
                </a>
              </div>
            )}
          {unreachableAuraInstance &&
            'Detected an unreachable Neo4j Aura instance, log into the aura console and double check that it is not paused or stopped and that the URL is correct'}
          {error && <div> {error} </div>}
          <div>
            HTTP GET {toHttp(debugUrl)}: {httpReachable.status}{' '}
          </div>
          <div>
            HTTPS GET {toHttps(debugUrl)}: {httpsReachable.status}{' '}
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
