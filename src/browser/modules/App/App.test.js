/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

/* global jest, test, expect */
import React from 'react'
import { render } from 'react-testing-library'
import { App } from './App'
import { buildConnectionCredentialsObject } from 'browser-components/DesktopIntegration/helpers'
import { flushPromises } from 'services/utils'

jest.mock('../FeatureToggle/FeatureToggleProvider', () => {
  return ({ children }) => <div>{children}</div>
})
jest.mock('./styled', () => {
  const orig = require.requireActual('./styled')
  return {
    ...orig,
    StyledApp: () => null
  }
})

describe('App', () => {
  test('App loads', async () => {
    // Given
    const getKerberosTicket = jest.fn(() => Promise.resolve('xxx'))
    const desktopIntegrationPoint = getIntegrationPoint(true, getKerberosTicket)
    let connectionCreds = null
    const props = {
      desktopIntegrationPoint,
      setInitialConnectionData: async (
        graph,
        credentials,
        context,
        getKerberosTicket
      ) => {
        connectionCreds = await buildConnectionCredentialsObject(
          context,
          {},
          getKerberosTicket
        )
      }
    }

    // When
    render(<App {...props} />)

    // Then
    await flushPromises()
    expect(connectionCreds).toMatchObject({
      authenticationMethod: 'KERBEROS',
      password: 'xxx'
    })
    expect(getKerberosTicket).toHaveBeenCalledTimes(1)
  })
})

const getIntegrationPoint = (kerberosEnabled, getKerberosTicket) => {
  const context = Promise.resolve(getDesktopContext(kerberosEnabled))
  return {
    getKerberosTicket: getKerberosTicket,
    getContext: () => context
  }
}

const getDesktopContext = (kerberosEnabled = false) => ({
  projects: [
    {
      graphs: [
        {
          status: 'ACTIVE',
          connection: {
            type: 'REMOTE',
            configuration: {
              authenticationMethods: {
                kerberos: {
                  enabled: kerberosEnabled,
                  servicePrincipal: 'KERBEROS'
                }
              },
              protocols: {
                bolt: {
                  enabled: true,
                  username: 'neo4j',
                  password: 'password',
                  tlsLevel: 'REQUIRED',
                  url: `bolt://localhost:7687`
                },
                http: {
                  enabled: true,
                  username: 'neo4j',
                  password: 'password',
                  host: 'localhost',
                  port: '7474'
                }
              }
            }
          }
        }
      ]
    }
  ]
})
