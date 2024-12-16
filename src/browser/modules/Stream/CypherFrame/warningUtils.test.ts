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

import type { GqlStatusObject } from 'neo4j-driver-core'
import {
  notificationCategory,
  notificationSeverityLevel
} from 'neo4j-driver-core'
import {
  formatSummaryFromGqlStatusObjects,
  formatSummaryFromNotifications
} from './warningUtilts'

describe('format rseult summary', () => {
  test('formats result summary for notifications', () => {
    const resultSummary = {
      server: {
        protocolVersion: 5.5
      },
      notifications: [
        {
          code: 'Neo.ClientNotification.Statement.CartesianProduct',
          title:
            'This query builds a cartesian product between disconnected patterns.',
          description:
            'If a part of a query contains multiple disconnected patterns, this will build a cartesian product between all those parts. This may produce a large amount of data and slow down query processing. While occasionally intended, it may often be possible to reformulate the query that avoids the use of this cross product, perhaps by adding a relationship between the different parts or by using OPTIONAL MATCH (identifiers are: ())',
          severity: 'INFORMATION',
          position: { offset: 0, line: 1, column: 1 },
          severityLevel: notificationSeverityLevel.INFORMATION,
          rawSeverityLevel: 'INFORMATION',
          category: notificationCategory.PERFORMANCE,
          rawCategory: 'PERFORMANCE'
        },
        {
          code: 'Neo.ClientNotification.Statement.UnknownLabelWarning',
          title: 'The provided label is not in the database.',
          description:
            "One of the labels in your query is not available in the database, make sure you didn't misspell it or that the label is available when you run this statement in your application (the missing label name is: A)",
          severity: 'WARNING',
          position: { offset: 9, line: 1, column: 10 },
          severityLevel: notificationSeverityLevel.WARNING,
          rawSeverityLevel: 'WARNING',
          category: notificationCategory.UNRECOGNIZED,
          rawCategory: 'UNRECOGNIZED'
        }
      ]
    }

    const result = formatSummaryFromNotifications(resultSummary)

    expect(result).toEqual([
      {
        code: 'Neo.ClientNotification.Statement.CartesianProduct',
        description:
          'If a part of a query contains multiple disconnected patterns, this will build a cartesian product between all those parts. This may produce a large amount of data and slow down query processing. While occasionally intended, it may often be possible to reformulate the query that avoids the use of this cross product, perhaps by adding a relationship between the different parts or by using OPTIONAL MATCH (identifiers are: ())',
        position: {
          column: 1,
          line: 1,
          offset: 0
        },
        title:
          'This query builds a cartesian product between disconnected patterns.',
        severity: 'INFORMATION'
      },
      {
        code: 'Neo.ClientNotification.Statement.UnknownLabelWarning',
        description:
          "One of the labels in your query is not available in the database, make sure you didn't misspell it or that the label is available when you run this statement in your application (the missing label name is: A)",
        position: {
          column: 10,
          line: 1,
          offset: 9
        },
        title: 'The provided label is not in the database.',
        severity: 'WARNING'
      }
    ])
  })

  test('formats result summary for gql status objects', () => {
    const gqlStatusObjects: [GqlStatusObject, ...GqlStatusObject[]] = [
      {
        gqlStatus: '03N90',
        statusDescription:
          "info: cartesian product. The disconnected pattern 'p = ()--(), q = ()--()' builds a cartesian product. A cartesian product may produce a large amount of data and slow down query processing.",
        diagnosticRecord: {
          OPERATION: '',
          OPERATION_CODE: '0',
          CURRENT_SCHEMA: '/',
          classification: 'PERFORMANCE'
        },
        position: { offset: 0, line: 1, column: 1 },
        severity: 'INFORMATION',
        rawSeverity: 'INFORMATION',
        classification: 'PERFORMANCE',
        rawClassification: 'PERFORMANCE',
        isNotification: true,
        diagnosticRecordAsJsonString: ''
      },
      {
        gqlStatus: '01N50',
        statusDescription:
          'warn: label does not exist. The label `A` does not exist. Verify that the spelling is correct.',
        diagnosticRecord: {
          OPERATION: '',
          OPERATION_CODE: '0',
          CURRENT_SCHEMA: '/'
        },
        position: { offset: 9, line: 1, column: 10 },
        severity: 'WARNING',
        rawSeverity: 'WARNING',
        classification: 'UNRECOGNIZED',
        rawClassification: 'UNRECOGNIZED',
        isNotification: true,
        diagnosticRecordAsJsonString: ''
      }
    ]
    const resultSummary = {
      server: {
        protocolVersion: 5.7
      },
      gqlStatusObjects
    }

    const result = formatSummaryFromGqlStatusObjects(resultSummary)

    expect(result).toEqual([
      {
        description:
          "The disconnected pattern 'p = ()--(), q = ()--()' builds a cartesian product. A cartesian product may produce a large amount of data and slow down query processing.",
        position: {
          column: 1,
          line: 1,
          offset: 0
        },
        title: '03N90: Cartesian product',
        severity: 'INFORMATION'
      },
      {
        description:
          'The label `A` does not exist. Verify that the spelling is correct.',
        position: {
          column: 10,
          line: 1,
          offset: 9
        },
        title: '01N50: Label does not exist',
        severity: 'WARNING'
      }
    ])
  })
})
