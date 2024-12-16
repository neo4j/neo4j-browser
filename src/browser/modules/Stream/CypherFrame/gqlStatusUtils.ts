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

import { capitalize, isNonEmptyString } from 'shared/utils/strings'

const gqlStatusIndexes = {
  title: 1,
  description: 2
}

const formatPropertyFromStatusDescripton = (
  index: number,
  gqlStatusDescription?: string
): string | undefined => {
  const matches =
    gqlStatusDescription?.match(
      /^(?:error|info|warn):\s(.+?)(?:\.(.+?))?\.?$/
    ) ?? []

  return matches[index] === undefined
    ? undefined
    : capitalize(matches[index].trim())
}

export const formatTitleFromGqlStatusDescription = (
  gqlStatusDescription?: string
): string => {
  return (
    formatPropertyFromStatusDescripton(
      gqlStatusIndexes.title,
      gqlStatusDescription
    )?.trim() ?? ''
  )
}

export const formatDescriptionFromGqlStatusDescription = (
  gqlStatusDescription?: string
): string => {
  const description =
    formatPropertyFromStatusDescripton(
      gqlStatusIndexes.description,
      gqlStatusDescription
    )?.trim() ?? ''

  return isNonEmptyString(description) && !description.endsWith('.')
    ? `${description}.`
    : description
}
