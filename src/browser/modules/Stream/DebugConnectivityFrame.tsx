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

import { version as browserVersion } from 'project-root/package.json'

export const ListItem = styled.li`
  list-style-type: disc;
  margin: 0 0 0 16px;
`
const SuccessText = styled.span`
  color: ${props => props.theme.success};
`
// need to set text color to avoid unreadable text in dark mode
const textStyle = { color: 'rgb(51, 51, 51)' }

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

  const resetState = () => {
    setHttpReachable({ status: 'noRequest' })
    setHttpsReachable({ status: 'noRequest' })
    setBoltReachablity({ status: 'not_started' })
    setEncryptedBoltReachability({ status: 'not_started' })
    setError(undefined)
  }

  useEffect(() => {
    try {
      resetState()

      if (debugUrl === '') {
        setError('Missing url argument. Usage  :debug connectivity [url]')
        return
      }
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
        setError(
          `Invalid url "${debugUrl}", must be a valid URL starting with bolt:// or neo4j://`
        )
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
          {(secureHostingUnencryptedBolt || unsecureHostingEncyptedBolt) && (
            <Alert
              title="Encryption mismatch detected"
              type="warning"
              icon
              style={textStyle}
            >
              When hosted on HTTPS Browser requires an encrypted connection
              (bolt+s:// or neo4j+s://) to neo4j. However when when it is hosted
              on HTTP some web browsers allow both encrypted and unencrypted
              connections, though it is not recommended.
              <div style={{ marginTop: '10px' }}>
                {secureHostingUnencryptedBolt && (
                  <div>
                    Neo4j Browser is hosted on https, but only an unencrypted
                    bolt connector was detected. To connect you will need to
                    either:
                    <ul>
                      <ListItem> Configure SSL on the bolt connector</ListItem>
                      <ListItem> Switch to running browser over HTTP </ListItem>
                    </ul>
                  </div>
                )}
                {unsecureHostingEncyptedBolt && (
                  <div>
                    Neo4j Browser is hosted on http but an encrypted bolt
                    connector was detected. It is recommended that you either:
                    <ul>
                      <ListItem>
                        Configure neo4j to serve Browser over HTTPS
                      </ListItem>
                      <ListItem>
                        Use the centrally hosted Browser available at{' '}
                        <StyledLink
                          href="https://browser.neo4j.io"
                          target="_blank"
                          rel="noreferrer"
                        >
                          browser.neo4j.io
                        </StyledLink>
                      </ListItem>
                      <ListItem>
                        Disable the bolt encryption on your Neo4j Server
                      </ListItem>
                    </ul>
                  </div>
                )}
              </div>
            </Alert>
          )}

          {advertisedAddress &&
            stripScheme(advertisedAddress) !== stripScheme(debugUrl) &&
            !isAura && (
              <Alert
                title="Found server at different URL"
                icon
                style={textStyle}
              >
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
            <Alert
              title="Unreachable Aura instance"
              type="warning"
              icon
              style={textStyle}
            >
              Log into the{' '}
              <StyledLink
                href="https://console.neo4j.io"
                target="_blank"
                rel="noreferrer"
              >
                {' '}
                aura console
              </StyledLink>{' '}
              and double check that it is not paused or stopped and that the URL
              is correct.
            </Alert>
          )}
          {onlyReachableViaHTTP && (
            <Alert
              title="Neo4j reachable via HTTP only"
              type="danger"
              icon
              style={textStyle}
            >
              Browser was able to reach{' '}
              <pre style={{ display: 'inline' }}>{debugUrl}</pre> with a HTTP
              request, but failed to do so via WebSocket. Browser requires a
              WebSocket connection to Neo4j, please check your network
              configuration to make sure a websocket connection on this port is
              possible.
            </Alert>
          )}
          {error && (
            <Alert title="Error" type="danger" icon style={textStyle}>
              {error}
            </Alert>
          )}
          {shouldWork && (
            <Alert
              title="Neo4j Server Reached"
              type="success"
              icon
              style={textStyle}
            >
              Neo4j Driver successfully completed bolt handshake with Neo4j
              Server at <pre>{debugUrl}</pre>
            </Alert>
          )}

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
                    on HTTPS.
                  </div>
                )}{' '}
                {httpStatuses.every(s => s === 'requestFailed') && !isAura && (
                  <Alert
                    title={
                      <>
                        All debugging requests failed against{' '}
                        <pre style={{ display: 'inline' }}>{debugUrl}</pre>
                      </>
                    }
                    type="danger"
                    icon
                    style={textStyle}
                  >
                    Double check the URL, make sure neo4j is running and that
                    you have a network connection if needed.
                  </Alert>
                )}
                {httpStatuses.some(
                  s => s === 'parsingJsonFailed' || s === 'foundOtherJSON'
                ) && (
                  <Alert
                    title="Found non-neo4j server"
                    type="warning"
                    icon
                    style={textStyle}
                  >
                    Found a server at
                    <pre style={{ display: 'inline' }}> {debugUrl} </pre>
                    but it does not seem to be a Neo4j Server.
                  </Alert>
                )}
              </div>
            )
          )}
          <details>
            <summary style={{ cursor: 'pointer', marginTop: '10px' }}>
              Full diagnostic details
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
            <pre>
              <div>Neo4j Browser Version: {browserVersion}</div>
              <div>User Agent: {navigator?.userAgent}</div>
              <div>Current time: {new Date().toISOString()} </div>
            </pre>
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
