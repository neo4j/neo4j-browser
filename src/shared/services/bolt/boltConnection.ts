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
import neo4j, { Driver } from 'neo4j-driver'

import { createDriverOrFailFn } from './driverFactory'
import {
  buildAuthObj,
  buildGlobalDriversObject,
  getGlobalDrivers,
  setGlobalDrivers,
  unsetGlobalDrivers
} from './globalDrivers'
import { Connection } from 'shared/modules/connections/connectionsDuck'
import { BoltConnectionError } from 'services/exceptions'

export const DIRECT_CONNECTION = 'DIRECT_CONNECTION'
export const ROUTED_WRITE_CONNECTION = 'ROUTED_WRITE_CONNECTION'
export const ROUTED_READ_CONNECTION = 'ROUTED_READ_CONNECTION'

export const hasMultiDbSupport = async (): Promise<boolean> => {
  if (!getGlobalDrivers()) {
    return false
  }
  const drivers = getGlobalDrivers()
  const tmpDriver = drivers && drivers.getRoutedDriver()
  if (!tmpDriver) {
    return false
  }
  const supportsMultiDb = await tmpDriver.supportsMultiDb()
  return supportsMultiDb
}

export const quickVerifyConnectivity = async (): Promise<void> => {
  if (!getGlobalDrivers()) {
    throw BoltConnectionError()
  }
  const drivers = getGlobalDrivers()
  const tmpDriver = drivers && drivers.getRoutedDriver()
  if (!tmpDriver) {
    throw BoltConnectionError()
  }

  try {
    // For browser to work on 4+ versions we need access to system db. Otherwise we can't list dbs.
    await tmpDriver.verifyConnectivity({ database: 'system' })
  } catch {
    // This checks connectivity for <4 versions.
    await tmpDriver.verifyConnectivity()
  }
}

export const validateConnection = (
  driver: Driver | null,
  res: (driver: Driver) => void,
  rej: (error?: any) => void
): void => {
  if (driver === null) {
    rej()
    return
  }

  driver
    .verifyConnectivity({ database: 'system' })
    .then(() => res(driver))
    .catch(() => {
      driver
        .verifyConnectivity()
        .then(() => res(driver))
        .catch(rej)
    })
}

export function directConnect(
  props: Connection,
  opts = {},
  onLostConnection: (error: Error) => void = (): void => undefined,
  shouldValidateConnection = true
): Promise<Driver> {
  const p = new Promise<Driver>((resolve, reject) => {
    const auth = buildAuthObj(props)
    const driver = createDriverOrFailFn(props.host || '', auth, opts, e => {
      onLostConnection(e)
      reject(e)
    })
    if (shouldValidateConnection) {
      validateConnection(driver, resolve, reject)
    } else {
      resolve(driver!)
    }
  })
  return p
}

export function openConnection(
  props: Connection,
  opts = {},
  onLostConnection: (error: Error) => void = (): void => undefined
): Promise<unknown> {
  const p = new Promise(async (resolve, reject) => {
    const onConnectFail = (e: Error): void => {
      onLostConnection(e)
      unsetGlobalDrivers()
      reject(e)
    }
    const driversObj = await buildGlobalDriversObject(
      props,
      opts,
      onConnectFail
    )
    const driver = driversObj.getRoutedDriver()
    const myResolve = (driver: Driver): void => {
      setGlobalDrivers(driversObj)
      resolve(driver)
    }
    const myReject = (err: Error): void => {
      onLostConnection(err)
      unsetGlobalDrivers()
      driversObj.close()
      reject(err)
    }
    validateConnection(driver, myResolve, myReject)
  })
  return p
}

export const closeGlobalConnection = (): void => {
  const globalDrivers = getGlobalDrivers()
  if (globalDrivers) {
    globalDrivers.close()
    unsetGlobalDrivers()
  }
}

export const ensureConnection = (
  props: Connection,
  opts: Record<string, unknown>,
  onLostConnection: () => void
): Promise<unknown> => {
  const session = getGlobalDrivers()
    ?.getDirectDriver()
    ?.session({ defaultAccessMode: neo4j.session.READ })
  if (session) {
    return new Promise<void>(resolve => {
      session.close()
      resolve()
    })
  } else {
    return openConnection(props, opts, onLostConnection)
  }
}
