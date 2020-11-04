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
import { buildTxFunctionByMode } from 'services/bolt/boltHelpers'
import { createDriverOrFailFn } from './driverFactory'
import {
  setGlobalDrivers,
  getGlobalDrivers,
  unsetGlobalDrivers,
  buildGlobalDriversObject,
  buildAuthObj
} from './globalDrivers'

export const DIRECT_CONNECTION = 'DIRECT_CONNECTION'
export const ROUTED_WRITE_CONNECTION = 'ROUTED_WRITE_CONNECTION'
export const ROUTED_READ_CONNECTION = 'ROUTED_READ_CONNECTION'

export const hasMultiDbSupport = async () => {
  if (!getGlobalDrivers()) {
    return false
  }
  const tmpDriver = getGlobalDrivers().getRoutedDriver()
  if (!tmpDriver) {
    return false
  }
  const supportsMultiDb = await tmpDriver.supportsMultiDb()
  return supportsMultiDb
}

export const validateConnection = (driver: any, res: any, rej: any) => {
  if (driver === null) {
    rej()
    return
  }

  driver
    .supportsMultiDb()
    .then((multiDbSupport: any) => {
      if (!driver || !driver.session) return rej('No connection')
      const session = driver.session({
        defaultAccessMode: neo4j.session.READ,
        database: multiDbSupport ? 'system' : undefined
      })
      const txFn = buildTxFunctionByMode(session)
      txFn((tx: any) => tx.run('CALL db.indexes()'))
        .then(() => {
          session.close()
          res(driver)
        })
        .catch((e: any) => {
          session.close()
          // Only invalidate the connection if not available
          // or not authed
          // or credentials have expired
          const invalidStates = [
            'ServiceUnavailable',
            'Neo.ClientError.Security.AuthenticationRateLimit',
            'Neo.ClientError.Security.Unauthorized',
            'Neo.ClientError.Security.CredentialsExpired'
          ]
          if (!e.code || invalidStates.includes(e.code)) {
            rej(e)
          } else {
            res(driver)
          }
        })
    })
    .catch(rej)
}

export function directConnect(
  props: any,
  opts = {},
  onLostConnection: (any: any) => any = () => {},
  shouldValidateConnection = true
) {
  const p = new Promise<any>((resolve, reject) => {
    const auth = buildAuthObj(props)
    const driver = createDriverOrFailFn(props.host, auth, opts, (e: any) => {
      onLostConnection(e)
      reject(e)
    })
    if (shouldValidateConnection) {
      validateConnection(driver, resolve, reject)
    } else {
      resolve(driver)
    }
  })
  return p
}

export function openConnection(
  props: any,
  opts = {},
  onLostConnection: any = () => {}
) {
  const p = new Promise(async (resolve, reject) => {
    const onConnectFail = (e: any) => {
      onLostConnection(e)
      unsetGlobalDrivers()
      reject(e)
    }
    const driversObj = await buildGlobalDriversObject(
      props,
      opts,
      onConnectFail
    )
    const driver = driversObj.getDirectDriver()
    const myResolve = (driver: any) => {
      setGlobalDrivers(driversObj)
      resolve(driver)
    }
    const myReject = (err: any) => {
      onLostConnection(err)
      unsetGlobalDrivers()
      driversObj.close()
      reject(err)
    }
    validateConnection(driver, myResolve, myReject)
  })
  return p
}

export const closeConnection = () => {
  if (getGlobalDrivers()) {
    getGlobalDrivers().close()
    unsetGlobalDrivers()
  }
}

export const ensureConnection = (
  props: any,
  opts: any,
  onLostConnection: any
) => {
  const session = getGlobalDrivers()
    ? getGlobalDrivers()
        .getDirectDriver()
        .session({ defaultAccessMode: neo4j.session.READ })
    : false
  if (session) {
    return new Promise(resolve => {
      session.close()
      resolve()
    })
  } else {
    return openConnection(props, opts, onLostConnection)
  }
}
