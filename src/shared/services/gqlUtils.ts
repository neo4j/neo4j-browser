import { gte } from 'semver'
import { GlobalState } from 'shared/globalState'
import { getSemanticVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { FIRST_GQL_ERRORS_NOTIFICATIONS_SUPPORT } from 'shared/modules/features/versionedFeatures'

export const gqlErrorsAndNotificationsEnabled = (
  state: GlobalState
): boolean => {
  const version = getSemanticVersion(state)
  return version ? gte(version, FIRST_GQL_ERRORS_NOTIFICATIONS_SUPPORT) : false
}
