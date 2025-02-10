import neo4j from 'neo4j-driver'
import { Driver } from 'neo4j-driver'
import { userActionTxMetadata } from 'services/bolt/txMetadata'
import { Connection } from './connectionsDuck'
import { SYSTEM_DB } from '../dbMeta/dbMetaDuck'
import { isError } from 'shared/utils/typeguards'

const MULTIDATABASE_NOT_SUPPORTED_ERROR_MESSAGE =
  'Driver is connected to the database that does not support multiple databases.'

export class MultiDatabaseNotSupportedError extends Error {}

export default {
  executePasswordResetQuery: async (
    driver: Driver,
    action: {
      query: string
      parameters: { oldPw: string; newPw: string } | { password: string }
    },
    metadata: { type: string; app: string },
    useDb = {}
  ): Promise<void> => {
    const session = driver.session({
      defaultAccessMode: neo4j.session.WRITE,
      ...useDb
    })

    try {
      await session.executeWrite(
        tx => tx.run(action.query, action.parameters),
        {
          metadata
        }
      )
    } catch (e) {
      throw isError(e) &&
        e.message.startsWith(MULTIDATABASE_NOT_SUPPORTED_ERROR_MESSAGE)
        ? new MultiDatabaseNotSupportedError(e.message)
        : e
    } finally {
      session.close()
    }
  },
  /**
   * Executes a query to change the user's password using Cypher available
   * on Neo4j versions since 4.0
   */
  executeAlterCurrentUserQuery: function (
    driver: Driver,
    action: Connection & { newPassword: string }
  ): Promise<void> {
    const payload = {
      query: 'ALTER CURRENT USER SET PASSWORD FROM $oldPw TO $newPw',
      parameters: {
        oldPw: action.password,
        newPw: action.newPassword
      }
    }

    return this.executePasswordResetQuery(
      driver,
      payload,
      userActionTxMetadata.txMetadata,
      { database: SYSTEM_DB }
    )
  },
  /**
   * Executes a query to change the user's password using legacy DBMS function
   * for versions of Neo4j older than 4.0
   */
  executeCallChangePasswordQuery: function (
    driver: Driver,
    action: { newPassword: string }
  ): Promise<void> {
    const payload = {
      query: 'CALL dbms.security.changePassword($password)',
      parameters: { password: action.newPassword }
    }

    return this.executePasswordResetQuery(
      driver,
      payload,
      userActionTxMetadata.txMetadata,
      undefined
    )
  }
}
