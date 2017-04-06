/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global location */
import bolt from './bolt'
import { getUrlInfo } from 'services/utils'

export const getEncryptionMode = () => {
  return location.protocol === 'https:'
}

export const getDiscoveryEndpoint = () => {
  const url = location.host ? location.href : 'http://localhost:7474/'
  const info = getUrlInfo(url)
  return `${info.protocol}//${info.host}/`
}

export const getServerConfig = () => {
  return bolt.directTransaction('CALL dbms.queryJmx("org.neo4j:*")')
    .then((res) => {
      // Find kernel conf
      let conf
      res.records.forEach((record) => {
        if (record.get('name').match(/Configuration$/)) conf = record.get('attributes')
      })
      return conf
    }).catch((e) => {
      return null
    })
}
