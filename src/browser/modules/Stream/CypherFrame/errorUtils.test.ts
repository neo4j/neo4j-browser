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

import { ErrorType } from 'services/exceptions'
import { formatError, formatErrorGqlStatusObject } from './errorUtils'

describe('error formatting', () => {
  test('formats an error with no gql fields correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message: 'epochSeconds cannot be selected together with datetime.',
      code: 'Neo.ClientError.Statement.ArgumentError'
    }

    const result = formatError(error)
    expect(result).toEqual({
      description: 'epochSeconds cannot be selected together with datetime.',
      title: 'Neo.ClientError.Statement.ArgumentError'
    })
  })

  test('formats a long error with no gql fields correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message:
        'The shortest path algorithm does not work when the start and end nodes are the same. This can happen if you perform a shortestPath search after a cartesian product that might have the same start and end nodes for some of the rows passed to shortestPath. If you would rather not experience this exception, and can accept the possibility of missing results for those rows, disable this in the Neo4j configuration by setting `dbms.cypher.forbid_shortestpath_common_nodes` to false. If you cannot accept missing results, and really want the shortestPath between two common nodes, then re-write the query using a standard Cypher variable length pattern expression followed by ordering by path length and limiting to one result.',
      code: 'Neo.DatabaseError.Statement.ExecutionFailed'
    }

    const result = formatError(error)
    expect(result).toEqual({
      description:
        'The shortest path algorithm does not work when the start and end nodes are the same. This can happen if you perform a shortestPath search after a cartesian product that might have the same start and end nodes for some of the rows passed to shortestPath. If you would rather not experience this exception, and can accept the possibility of missing results for those rows, disable this in the Neo4j configuration by setting `dbms.cypher.forbid_shortestpath_common_nodes` to false. If you cannot accept missing results, and really want the shortestPath between two common nodes, then re-write the query using a standard Cypher variable length pattern expression followed by ordering by path length and limiting to one result.',
      title: 'Neo.DatabaseError.Statement.ExecutionFailed'
    })
  })

  test('formats a gql error correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message: 'Expected parameter(s): param',
      code: 'Neo.ClientError.Statement.ParameterMissing',
      gqlStatus: '42N51',
      gqlStatusDescription:
        'error: syntax error or access rule violation - invalid parameter. Invalid parameter $`param`.',
      cause: {
        gqlStatus: '22G03',
        gqlStatusDescription: '22G03',
        cause: {
          gqlStatus: '22N27',
          gqlStatusDescription:
            "error: data exception - invalid entity type. Invalid input '******' for $`param`. Expected to be STRING."
        }
      }
    }

    const result = formatErrorGqlStatusObject(error)
    expect(result).toEqual({
      description: 'Invalid parameter $`param`.',
      innerError: {
        cause: {
          gqlStatus: '22N27',
          gqlStatusDescription:
            "error: data exception - invalid entity type. Invalid input '******' for $`param`. Expected to be STRING."
        },
        gqlStatus: '22G03',
        gqlStatusDescription: '22G03'
      },
      title: '42N51: Syntax error or access rule violation - invalid parameter'
    })
  })

  test('formats a gql error with no description correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message: 'epochSeconds cannot be selected together with datetime.',
      code: 'Neo.ClientError.Statement.ArgumentError',
      gqlStatus: '22007',
      gqlStatusDescription:
        'error: data exception - invalid date, time, or datetime format',
      cause: {
        gqlStatus: '22N14',
        gqlStatusDescription:
          "error: data exception - invalid temporal value combination. Cannot select both epochSeconds and 'datetime'."
      }
    }

    const result = formatErrorGqlStatusObject(error)
    expect(result).toEqual({
      description: '',
      title: '22007: Data exception - invalid date, time, or datetime format',
      innerError: {
        gqlStatus: '22N14',
        gqlStatusDescription:
          "error: data exception - invalid temporal value combination. Cannot select both epochSeconds and 'datetime'."
      }
    })
  })

  test('formats a gql error with only a gql status correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message: '',
      code: '',
      gqlStatus: '22G03',
      gqlStatusDescription: '22G03',
      cause: undefined
    }

    const result = formatErrorGqlStatusObject(error)
    expect(result).toEqual({
      description: '',
      title: '22G03',
      innerError: undefined
    })
  })

  test('formats a gql error with a cause correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message: '',
      code: '',
      gqlStatus: '22N27',
      gqlStatusDescription:
        "error: data exception - invalid entity type. Invalid input '******' for $`param`. Expected to be STRING.",
      cause: undefined
    }

    const result = formatErrorGqlStatusObject(error)
    expect(result).toEqual({
      description:
        "Invalid input '******' for $`param`. Expected to be STRING.",
      title: '22N27: Data exception - invalid entity type',
      innerError: undefined
    })
  })

  test('formats a long gql error correctly', () => {
    const error = {
      type: 'Neo4jError' as ErrorType,
      message:
        'The shortest path algorithm does not work when the start and end nodes are the same. This can happen if you perform a shortestPath search after a cartesian product that might have the same start and end nodes for some of the rows passed to shortestPath. If you would rather not experience this exception, and can accept the possibility of missing results for those rows, disable this in the Neo4j configuration by setting `dbms.cypher.forbid_shortestpath_common_nodes` to false. If you cannot accept missing results, and really want the shortestPath between two common nodes, then re-write the query using a standard Cypher variable length pattern expression followed by ordering by path length and limiting to one result.',
      code: 'Neo.DatabaseError.Statement.ExecutionFailed',
      gqlStatus: '51N23',
      gqlStatusDescription:
        "error: system configuration or operation exception - cyclic shortest path search disabled. Cannot find the shortest path when the start and end nodes are the same. To enable this behavior, set 'dbms.cypher.forbid_shortestpath_common_nodes' to false.",
      cause: undefined
    }

    const result = formatErrorGqlStatusObject(error)
    expect(result).toEqual({
      description:
        "Cannot find the shortest path when the start and end nodes are the same. To enable this behavior, set 'dbms.cypher.forbid_shortestpath_common_nodes' to false.",
      title:
        '51N23: System configuration or operation exception - cyclic shortest path search disabled',
      innerError: undefined
    })
  })
})
