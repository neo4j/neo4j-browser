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

import { cleanupSettings } from './dbMetaEpics'
import { ClientSettings } from './dbMetaDuck'

const defaultSettings: ClientSettings = {
  allowOutgoingConnections: true,
  credentialTimeout: 0,
  postConnectCmd: '',
  remoteContentHostnameAllowlist: 'guides.neo4j.com, localhost',
  retainConnectionCredentials: true,
  retainEditorHistory: true,
  allowTelemetry: true,
  authEnabled: true,
  metricsNamespacesEnabled: false,
  metricsPrefix: 'neo4j'
}

describe('cleanupSettings', () => {
  test('should cleanup settings', () => {
    const rawSettings = {
      'browser.allow_outgoing_connections': 'true',
      'browser.credential_timeout': '0s',
      'browser.post_connect_cmd': 'match (n) return n',
      'browser.remote_content_hostname_whitelist': 'guides.neo4j.com,localhost',
      'browser.retain_connection_credentials': 'true',
      'browser.retain_editor_history': 'true',
      'client.allow_telemetry': 'true',
      'dbms.default_database': 'neo4j',
      'dbms.security.auth_enabled': 'true',
      'server.metrics.namespaces.enabled': 'false',
      'server.metrics.prefix': 'neo4j4j'
    }
    const expectedSettings: ClientSettings = {
      allowOutgoingConnections: true,
      credentialTimeout: '0s',
      postConnectCmd: 'match (n) return n',
      remoteContentHostnameAllowlist: 'guides.neo4j.com,localhost',
      retainConnectionCredentials: true,
      retainEditorHistory: true,
      allowTelemetry: true,
      authEnabled: true,
      metricsNamespacesEnabled: false,
      metricsPrefix: 'neo4j4j'
    }

    const newSettings = cleanupSettings(rawSettings)

    expect(newSettings).toEqual(expectedSettings)
  })
  test('default values', () => {
    const newSettings = cleanupSettings({})
    expect(newSettings).toEqual(defaultSettings)
  })
  test('browser.allow_outgoing_connections="false"', () => {
    const newSettings = cleanupSettings({
      'browser.allow_outgoing_connections': 'false'
    })
    const expectedSettings = {
      ...defaultSettings,
      allowOutgoingConnections: false
    }
    expect(newSettings).toEqual(expectedSettings)
  })
  test('browser.allow_outgoing_connections="true"', () => {
    const newSettings = cleanupSettings({
      'browser.allow_outgoing_connections': 'true'
    })
    const expectedSettings: ClientSettings = {
      ...defaultSettings,
      allowOutgoingConnections: true
    }
    expect(newSettings).toEqual(expectedSettings)
  })
  test('clients.allow_telemetry="false"', () => {
    const newSettings = cleanupSettings({ 'clients.allow_telemetry': 'false' })
    const expectedSettings: ClientSettings = {
      ...defaultSettings,
      allowTelemetry: false
    }
    expect(newSettings).toEqual(expectedSettings)
  })
  test('client.allow_telemetry="false"', () => {
    const newSettings = cleanupSettings({ 'client.allow_telemetry': 'false' })
    const expectedSettings: ClientSettings = {
      ...defaultSettings,
      allowTelemetry: false
    }
    expect(newSettings).toEqual(expectedSettings)
  })
})
