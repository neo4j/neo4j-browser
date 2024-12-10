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
