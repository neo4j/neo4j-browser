/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

export const getEncryptionMode = options => {
  if (options && typeof options['encrypted'] !== 'undefined') {
    return options.encrypted
  }
  return location.protocol === 'https:'
}

export const getDiscoveryEndpoint = () => {
  const url = location.host ? location.href : 'http://localhost:7474/'
  const info = getUrlInfo(url)
  return `${info.protocol}//${info.host}/`
}

export const getServerConfig = (includePrefixes = []) => {
  return getJmxValues([['Configuration']]).then(confs => {
    if (!confs) return {}
    const conf = confs[0]
    let filtered
    if (conf) {
      Object.keys(conf)
        .filter(
          key =>
            includePrefixes.length < 1 ||
            includePrefixes.some(pfx => key.startsWith(pfx))
        )
        .forEach(
          key =>
            (filtered = {
              ...filtered,
              [key]: bolt.itemIntToNumber(conf[key].value)
            })
        )
    }
    return filtered || conf
  })
}

export const getJmxValues = (nameAttributePairs = []) => {
  if (!nameAttributePairs.length) return Promise.reject(new Error())
  return bolt
    .directTransaction('CALL dbms.queryJmx("org.neo4j:*")')
    .then(res => {
      let out = []
      nameAttributePairs.forEach(pair => {
        const [name, attribute = null] = pair
        if (!name) return out.push(null)
        const part = res.records.filter(record =>
          record.get('name').match(new RegExp(name + '$'))
        )
        if (!part.length) return out.push(null)
        const attributes = part[0].get('attributes')
        if (!attribute) return out.push(attributes)
        const key = attribute
        if (typeof attributes[key] === 'undefined') return out.push(null)
        const val = bolt.itemIntToNumber(attributes[key].value)
        out.push({ [key]: val })
      })
      return out
    })
    .catch(e => {
      return null
    })
}

export const isConfigValTruthy = val =>
  [true, 'true', 'yes', 1, '1'].indexOf(val) > -1
export const isConfigValFalsy = val =>
  [false, 'false', 'no', 0, '0'].indexOf(val) > -1
