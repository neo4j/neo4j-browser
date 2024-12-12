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

import { isNonEmptyString } from 'shared/utils/strings'
import {
  formatDescriptionFromGqlStatusDescription,
  formatTitleFromGqlStatusDescription
} from './gqlStatusUtils'
import { BrowserError } from 'services/exceptions'

export function isBrowserError(object: unknown): object is BrowserError {
  if (object !== null && typeof object === 'object') {
    return (
      'type' in object ||
      'message' in object ||
      'code' in object ||
      'gqlStatus' in object
    )
  }

  return false
}

type FormattedError = {
  title?: string
  description?: string
  innerError?: Pick<
    BrowserError,
    'gqlStatus' | 'gqlStatusDescription' | 'cause'
  >
}

const mapBrowserErrorToFormattedError = (
  error: BrowserError
): FormattedError => {
  const gqlStatusTitle = formatTitleFromGqlStatusDescription(
    error.gqlStatusDescription
  )
  const { gqlStatus } = error
  const description = formatDescriptionFromGqlStatusDescription(
    error.gqlStatusDescription
  )
  const title = isNonEmptyString(gqlStatusTitle) ? gqlStatusTitle : description
  return {
    title: isNonEmptyString(title) ? `${gqlStatus}: ${title}` : gqlStatus,
    description
  }
}

export const hasPopulatedGqlFields = (
  error: BrowserError | Error
): error is BrowserError & {
  gqlStatus: string
  gqlStatusDescription: string
  cause?: BrowserError
} => {
  return (
    'gqlStatus' in error &&
    error.gqlStatus !== undefined &&
    'gqlStatusDescription' in error &&
    error.gqlStatusDescription !== undefined &&
    'cause' in error
  )
}

export const formatErrorGqlStatusObject = (
  error: BrowserError
): FormattedError => {
  return {
    ...mapBrowserErrorToFormattedError(error),
    innerError: error.cause
  }
}

export const formatError = (error: BrowserError): FormattedError => {
  const { code: title, message: description } = error

  return {
    title,
    description
  }
}
