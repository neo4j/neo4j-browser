import type { Notification, NotificationSeverityLevel } from 'neo4j-driver'
import {
  GqlStatusObject,
  NotificationPosition,
  ResultSummary
} from 'neo4j-driver-core'
import {
  formatDescriptionFromGqlStatusDescription,
  formatTitleFromGqlStatusDescription
} from './gqlStatusUtils'
import { isNonEmptyString } from 'shared/utils/strings'

export type FormattedNotification = {
  title?: string
  description: string
  position?: NotificationPosition
  code?: string | null
  severity?: NotificationSeverityLevel | string
}

const mapGqlStatusObjectsToFormattedNotifications = (
  statusObjects: Omit<GqlStatusObject, 'diagnosticRecordAsJsonString'>[]
): FormattedNotification[] => {
  return statusObjects.map(statusObject => {
    const gqlStatusTitle = formatTitleFromGqlStatusDescription(
      statusObject.statusDescription
    )
    const { gqlStatus } = statusObject
    const description = formatDescriptionFromGqlStatusDescription(
      statusObject.statusDescription
    )
    const title = isNonEmptyString(gqlStatusTitle)
      ? gqlStatusTitle
      : description
    return {
      title: isNonEmptyString(title) ? `${gqlStatus}: ${title}` : gqlStatus,
      description,
      position: statusObject.position,
      severity: statusObject.severity
    }
  })
}

const mapNotificationsToFormattedNotifications = (
  notifications: Notification[]
): FormattedNotification[] => {
  return notifications.map(notification => ({
    title: notification.title,
    description: notification.description,
    position: notification.position,
    severity: notification.severity,
    code: notification.code
  }))
}

export const formatNotificationsFromSummary = (
  resultSummary: Partial<ResultSummary>
): FormattedNotification[] => {
  const { protocolVersion } = resultSummary.server ?? {}
  const severityLevels = ['ERROR', 'WARNING', 'INFORMATION']
  if (protocolVersion === undefined || protocolVersion < 5.6) {
    const filteredNotifications =
      resultSummary.notifications?.filter(x =>
        severityLevels.includes(x.severity)
      ) ?? []
    return mapNotificationsToFormattedNotifications(filteredNotifications)
  }

  const filteredStatusObjects =
    resultSummary.gqlStatusObjects?.filter(x =>
      severityLevels.includes(x.severity)
    ) ?? []
  return mapGqlStatusObjectsToFormattedNotifications(filteredStatusObjects)
}
