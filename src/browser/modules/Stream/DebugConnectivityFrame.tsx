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
import React, { Dispatch, useEffect, useState } from 'react'
import * as commands from 'shared/modules/commands/commandsDuck'
import { connect } from 'react-redux'
import { Action } from 'redux'
import { stripScheme } from 'services/boltscheme.utils'
import { isValidUrl } from 'shared/modules/commands/helpers/http'
import { Frame } from 'shared/modules/frames/framesDuck'
import FrameAside from '../Frame/FrameAside'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import {
  boltReachabilityCheck,
  httpReachabilityCheck,
  HttpReachablity
} from './Auth/ConnectForm'
import { BaseFrameProps } from './Stream'
import { StyledLink } from 'browser-components/buttons'
import { Alert } from '@neo4j-ndl/react'
import styled from 'styled-components'

const SuccessText = styled.span`
  color: ${props => props.theme.success};
`

/* TODO
- e2e tests

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

function removeEncryptedScheme(url: string) {
  const [scheme, ...rest] = url.split('+s')
  return [scheme, ...rest].join('')
}

type BoltReachabilty =
  | { status: 'not_started' }
  | { status: 'loading' }
  | { status: 'succeeded' }
  | { status: 'error'; error: Neo4jError }

type DebugConnectivityFrameProps = BaseFrameProps & {
  checkOtherUrl?: ({ useDb, id }: Frame, url: string) => void
}

const DebugConnectivityFrame = (props: DebugConnectivityFrameProps) => {
  const debugUrl = props.frame.urlToDebug ?? ''

  const [httpReachability, setHttpReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })
  const [httpsReachability, setHttpsReachable] = useState<HttpReachablity>({
    status: 'noRequest'
  })

  const [boltReachability, setBoltReachablity] = useState<BoltReachabilty>({
    status: 'not_started'
  })

  const [encryptedBoltReachability, setEncryptedBoltReachability] =
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
        boltReachabilityCheck(removeEncryptedScheme(debugUrl), false).then(
          r => {
            if (r === true) {
              setBoltReachablity({ status: 'succeeded' })
            } else {
              setBoltReachablity({ status: 'error', error: r })
            }
          }
        )

        setEncryptedBoltReachability({ status: 'loading' })
        boltReachabilityCheck(removeEncryptedScheme(debugUrl), true).then(r => {
          if (r === true) {
            setEncryptedBoltReachability({ status: 'succeeded' })
          } else {
            setEncryptedBoltReachability({ status: 'error', error: r })
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
    isAura && encryptedBoltReachability.status === 'error'

  const advertisedAddress =
    httpReachability.status === 'foundAdvertisedBoltAddress'
      ? httpReachability.advertisedAddress
      : httpsReachability.status === 'foundAdvertisedBoltAddress' &&
        httpsReachability.advertisedAddress

  const isSecurelyHosted = (window?.location?.protocol ?? '')
    .toLowerCase()
    .includes('https')

  const onlyReachableOnBolt =
    boltReachability.status === 'succeeded' &&
    encryptedBoltReachability.status === 'error'

  const noBoltReachable =
    boltReachability.status === 'error' &&
    encryptedBoltReachability.status === 'error'

  const secureHostingUnencryptedBolt = isSecurelyHosted && onlyReachableOnBolt

  const unsecureHostingEncyptedBolt =
    !isSecurelyHosted && encryptedBoltReachability.status === 'succeeded'

  const shouldWork =
    (isSecurelyHosted && encryptedBoltReachability.status === 'succeeded') ||
    (!isSecurelyHosted && boltReachability.status === 'succeeded')

  const onlyReachableViaHTTP =
    (httpReachability.status === 'foundBoltPort' ||
      httpsReachability.status === 'foundBoltPort') &&
    boltReachability.status === 'error' &&
    encryptedBoltReachability.status === 'error'

  const somethingIsLoading = [
    httpReachability.status,
    httpsReachability.status,
    boltReachability.status,
    encryptedBoltReachability.status
  ].includes('loading')

  const httpStatuses = [httpReachability.status, httpsReachability.status]

  return (
    <FrameBodyTemplate
      isCollapsed={props.isCollapsed}
      isFullscreen={props.isFullscreen}
      aside={
        <FrameAside
          title={'Debug connectivity'}
          subtitle={
            <>
              Neo4j Browser requires a{' '}
              <span style={{ fontWeight: 500 }}>WebSocket connection</span> to
              the bolt connector port on the Neo4j Server.{' '}
            </>
          }
        />
      }
      contents={
        <div style={{ maxWidth: '700px' }}>
          {somethingIsLoading ? (
            <SpinnerIcon />
          ) : (
            noBoltReachable && (
              <div>
                {isSecurelyHosted && (
                  <div>
                    When browser is hosted on HTTPS a encrypted connection to
                    neo4j is required. Therefore only the encrypted protocols
                    bolt+s:// and neo4j+s:// are enabled when Browser is hosted
                    on HTTPS. Setting up SSL can be tricky to get right, here is
                    a link to a knowledgebase article to help.
                  </div>
                )}{' '}
                {httpStatuses.every(s => s === 'requestFailed') &&
                  'All debugging requests failed. Make sure neo4j is running and that you have a network connection if needed.'}
                {httpStatuses.some(
                  s => s === 'parsingJsonFailed' || 'foundOtherJSON'
                ) && (
                  <>
                    Found a server at
                    <pre style={{ display: 'inline' }}> {debugUrl} </pre>
                    but it does not seem to be a Neo4j Server.
                  </>
                )}
              </div>
            )
          )}

          {(secureHostingUnencryptedBolt || unsecureHostingEncyptedBolt) && (
            <Alert title="Encryption mismatch detected" type="warning" icon>
              When browser is hosted on HTTPS an encrypted connection (bolt+s://
              or neo4j+s://) to neo4j is required and conversely when it is
              hosted on HTTP it needs an unencrypted connection (bolt:// or
              neo4j://).
              {secureHostingUnencryptedBolt && (
                <div>
                  Neo4j Browser is hosted on https, but only an unencrypted bolt
                  connector was detected. To connect you will need to either:
                  <ul>
                    <li> Configure a SSL on the bolt connector - LINK</li>
                    <li> Switch to running browser over HTTP </li>
                  </ul>
                </div>
              )}
              {unsecureHostingEncyptedBolt && (
                <div>
                  Neo4j Browser is hosted on http but an encrypted bolt
                  connector was detected. To connect you will need to either:
                  <ul>
                    <li>Configure neo4j to serve Browser over HTTPS</li>
                    <li>
                      Use the centrally hosted browser{' '}
                      <StyledLink
                        href="https://browser.neo4j.io"
                        target="_blank"
                        rel="noreferrer"
                      >
                        browser.neo4j.io
                      </StyledLink>
                    </li>
                    <li>Disable the bolt encryption on neo4j server</li>
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {advertisedAddress &&
            stripScheme(advertisedAddress) !== stripScheme(debugUrl) && (
              <Alert title="Found server at different URL" icon>
                The neo4j server we reached advertised its bolt connector at
                <StyledLink
                  onClick={() =>
                    props.checkOtherUrl?.(props.frame, advertisedAddress)
                  }
                >
                  {' '}
                  {advertisedAddress}, try that instead?
                </StyledLink>
              </Alert>
            )}
          {unreachableAuraInstance && (
            <Alert title="Unreachable Aura instance" type="warning" icon>
              Log into the aura console and double check that it is not paused
              or stopped and that the URL is correct
            </Alert>
          )}
          {onlyReachableViaHTTP && (
            <Alert title="Neo4j reachable via HTTP only" type="danger" icon>
              Browser was able to reach{' '}
              <pre style={{ display: 'inline' }}>{debugUrl}</pre> with a HTTP
              request, but failed to do so via WebSocket. Browser requires a
              WebSocket connection to Neo4j, please check your network
              configuration to make sure a websocket connection on this port is
              possible.
            </Alert>
          )}
          {error && (
            <Alert title="Error" type="danger" icon>
              {error}
            </Alert>
          )}
          {shouldWork && (
            <Alert title="Neo4j Server Reached" type="success" icon>
              Neo4j Driver successfully completed bolt handshake with Neo4j
              Server at <pre>{debugUrl}</pre>
            </Alert>
          )}
          <details>
            <summary style={{ cursor: 'pointer', marginTop: '10px' }}>
              Full network debugging details
            </summary>
            Browser will attempt to open a websocket connection to{' '}
            <pre style={{ display: 'inline' }}>{debugUrl}</pre> and do an
            encrypted and an unencrypted bolt handshake.
            <div
              style={{
                display: 'flex',
                marginTop: '10px',
                marginBottom: '20px',
                gap: '50px'
              }}
            >
              {[
                { encrypted: false, reachability: boltReachability },
                { encrypted: true, reachability: encryptedBoltReachability }
              ].map(({ encrypted, reachability }) => (
                <div key={String(encrypted)}>
                  <pre style={{ fontWeight: 500 }}>
                    {encrypted ? 'encrypted bolt handshake' : 'bolt handshake'}
                  </pre>
                  <div style={{ maxWidth: '400px' }}>
                    Status:{' '}
                    {reachability.status === 'loading' && <SpinnerIcon />}
                    {reachability.status === 'succeeded' && (
                      <SuccessText>Handshake success </SuccessText>
                    )}
                    {reachability.status === 'error' && (
                      <details style={{ display: 'inline' }}>
                        <summary style={{ cursor: 'pointer' }}>Error</summary>{' '}
                        {reachability.error.message}
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div>
              The bolt connector port only supports running cypher transactions
              via websocket but it can respond to HTTP requests with some
              limited server information. Using this Browser can try to detect a
              running neo4j server at{' '}
              <pre style={{ display: 'inline' }}>{debugUrl}</pre> by doing a GET
              request.
            </div>
            <div
              style={{
                display: 'flex',
                gap: '50px',
                marginTop: '10px',
                paddingBottom: '50px'
              }}
            >
              {[
                {
                  header: `HTTP GET ${toHttp(debugUrl)}`,
                  reachability: httpReachability
                },
                {
                  header: `HTTPs GET ${toHttps(debugUrl)}`,
                  reachability: httpsReachability
                }
              ].map(({ header, reachability }) => (
                <div key={header}>
                  <pre style={{ fontWeight: 500 }}>{header}</pre>
                  <div style={{ maxWidth: '400px' }}>
                    Status:{' '}
                    {reachability.status === 'loading' && <SpinnerIcon />}
                    {reachability.status === 'requestFailed' && (
                      <details style={{ display: 'inline' }}>
                        <summary style={{ cursor: 'pointer' }}>
                          Request failed
                        </summary>
                        {reachability.error.message}
                        <div>
                          Check your web browsers developer tools network tab
                          for more details.
                        </div>
                      </details>
                    )}
                    {reachability.status === 'parsingJsonFailed' &&
                      'Found non-neo4j data, invalid JSON'}
                    {reachability.status === 'foundOtherJSON' &&
                      'Found non-neo4j API'}
                    {reachability.status === 'foundBoltPort' && (
                      <SuccessText>Found bolt connector</SuccessText>
                    )}
                    {reachability.status === 'foundAdvertisedBoltAddress' && (
                      <>
                        Found http connector advertising{' '}
                        <pre style={{ display: 'inline' }}>
                          {reachability.advertisedAddress}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      }
    />
  )
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  checkOtherUrl: ({ useDb, id }: Frame, url: string) => {
    dispatch(
      commands.executeCommand(`:debug connectivity ${url}`, {
        id,
        useDb,
        isRerun: true,
        source: commands.commandSources.rerunFrame
      })
    )
  }
})

export default connect(null, mapDispatchToProps)(DebugConnectivityFrame)
