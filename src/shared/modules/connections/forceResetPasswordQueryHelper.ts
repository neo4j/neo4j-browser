import neo4j from 'neo4j-driver'
import { Driver } from 'neo4j-driver'
import { userActionTxMetadata } from 'services/bolt/txMetadata'
import { Connection } from './connectionsDuck'
import { SYSTEM_DB } from '../dbMeta/dbMetaDuck'
import { buildTxFunctionByMode } from 'services/bolt/boltHelpers'

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

    const txFn = buildTxFunctionByMode(session)

    txFn &&
      (await txFn(
        async (tx: { run: (input: string, parameters: unknown) => unknown }) =>
          await tx.run(action.query, action.parameters),
        {
          metadata
        }
      )
        .catch(e => {
          throw e
        })
        .finally(() => {
          session.close()
        }))
  },
  /**
   * Executes a query to change the user's password using Cypher available
   * on Neo4j versions since 4.0
   */
  executeAlterCurrentUserQuery: function (
    driver: Driver,
    action: Connection & { newPassword: string },
    supportsMultiDb: boolean
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
      supportsMultiDb ? { database: SYSTEM_DB } : undefined
    )
  },
  /**
   * Executes a query to change the user's password using legacy DBMS function
   * for versions of Neo4j older than 4.0
   */
  executeCallChangePasswordQuery: function (
    driver: Driver,
    action: { newPassword: string },
    supportsMultiDb: boolean
  ): Promise<void> {
    const payload = {
      query: 'CALL dbms.security.changePassword($password)',
      parameters: { password: action.newPassword }
    }

    return this.executePasswordResetQuery(
      driver,
      payload,
      userActionTxMetadata.txMetadata,
      supportsMultiDb ? { database: SYSTEM_DB } : undefined
    )
  }
}
