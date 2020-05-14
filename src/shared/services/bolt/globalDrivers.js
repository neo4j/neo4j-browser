/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import neo4j from 'neo4j-driver'
import { createDriverOrFailFn } from './driverFactory'
import { KERBEROS, NATIVE } from 'services/bolt/boltHelpers'
import { stripScheme, getSchemeFlag } from 'services/utils'

let _drivers = null

const BOLT_DIRECT_SCHEME = 'bolt'

const isNonRoutingScheme = url => url.startsWith(BOLT_DIRECT_SCHEME)
const toNonRoutingScheme = url =>
  `${BOLT_DIRECT_SCHEME}${getSchemeFlag(url)}://${stripScheme(url)}`

export const getGlobalDrivers = () => _drivers
export const setGlobalDrivers = drivers => (_drivers = drivers)
export const unsetGlobalDrivers = () => (_drivers = null)

export const buildGlobalDriversObject = (
  props,
  opts = {},
  failFn = () => {}
) => {
  const driversObj = {}
  const auth = buildAuthObj(props)
  const getDirectDriver = () => {
    if (driversObj.direct) return driversObj.direct
    const directUrl = toNonRoutingScheme(props.host)
    driversObj.direct = createDriverOrFailFn(directUrl, auth, opts, failFn)
    return driversObj.direct
  }
  const getRoutedDriver = () => {
    if (isNonRoutingScheme(props.host)) return getDirectDriver()
    if (driversObj.routed) return driversObj.routed
    driversObj.routed = createDriverOrFailFn(props.host, auth, opts, failFn)
    return driversObj.routed
  }
  return {
    getDirectDriver,
    getRoutedDriver,
    close: () => {
      if (driversObj.direct) driversObj.direct.close()
      if (driversObj.routed) driversObj.routed.close()
    }
  }
}

export const buildAuthObj = props => {
  let auth
  if (props.authenticationMethod === KERBEROS) {
    auth = neo4j.auth.kerberos(props.password)
  } else if (
    props.authenticationMethod === NATIVE ||
    !props.authenticationMethod
  ) {
    auth = neo4j.auth.basic(props.username, props.password)
  } else {
    auth = null
  }
  return auth
}
