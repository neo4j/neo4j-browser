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

import {
  formatDescriptionFromGqlStatusDescription,
  formatTitleFromGqlStatusDescription
} from './gqlStatusUtils'

describe('gql status formatting', () => {
  test('formats a title from a gql status description correctly', () => {
    const gqlStatusDescription =
      'error: syntax error or access rule violation - invalid parameter. Invalid parameter $`param`.'

    const result = formatTitleFromGqlStatusDescription(gqlStatusDescription)

    expect(result).toEqual(
      'Syntax error or access rule violation - invalid parameter'
    )
  })

  test('formats a description from a gql status description correctly', () => {
    const gqlStatusDescription =
      "error: system configuration or operation exception - cyclic shortest path search disabled. Cannot find the shortest path when the start and end nodes are the same. To enable this behavior, set 'dbms.cypher.forbid_shortestpath_common_nodes' to false."

    const result =
      formatDescriptionFromGqlStatusDescription(gqlStatusDescription)

    expect(result).toEqual(
      "Cannot find the shortest path when the start and end nodes are the same. To enable this behavior, set 'dbms.cypher.forbid_shortestpath_common_nodes' to false."
    )
  })

  test('formats a description with no period correctly', () => {
    const gqlStatusDescription =
      'error: system configuration or operation exception - cyclic shortest path search disabled. Cannot find the shortest path when the start and end nodes are the same'
    const result =
      formatDescriptionFromGqlStatusDescription(gqlStatusDescription)

    expect(result).toEqual(
      'Cannot find the shortest path when the start and end nodes are the same.'
    )
  })

  test('formats a title from a gql status description with no matches correctly', () => {
    const gqlStatusDescription =
      'Unfortunately, no one can be told what the Matrix is. You have to see it for yourself'
    const result = formatTitleFromGqlStatusDescription(gqlStatusDescription)

    expect(result).toEqual('')
  })

  test('formats a description from a gql status description with no matches correctly', () => {
    const gqlStatusDescription = 'Believe the unbelievable'
    const result =
      formatDescriptionFromGqlStatusDescription(gqlStatusDescription)

    expect(result).toEqual('')
  })
})
