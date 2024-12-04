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
import { render } from '@testing-library/react'
import React from 'react'

import { WarningsView } from './WarningsView'

describe('WarningsViews', () => {
  describe('WarningsView', () => {
    test('displays nothing if no notifications', () => {
      // Given
      const props = {
        result: {}
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })

    test('does displays a warning', () => {
      // Given
      const props = {
        result: {
          summary: {
            notifications: [
              {
                severity: 'WARNING',
                title: 'My xx1 warning',
                description: 'This is xx2 warning',
                position: {
                  offset: 7,
                  line: 1
                },
                code: 'xx3.Warning'
              }
            ],
            query: {
              text: 'EXPLAIN MATCH xx3'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })

    test('does display a warning for GQL status codes', () => {
      // Given
      const props = {
        result: {
          summary: {
            server: {
              protocolVersion: 5.6
            },
            gqlStatusObjects: [
              {
                severity: 'WARNING',
                gqlStatus: '03N90',
                statusDescription:
                  "info: cartesian product. The disconnected pattern 'p = ()--(), q = ()--()' builds a cartesian product. A cartesian product may produce a large amount of data and slow down query processing.",
                position: {
                  offset: 7,
                  line: 1
                }
              }
            ],
            query: {
              text: 'MATCH p=()--(), q=()--() RETURN p, q'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })

    test('does display multiple warnings', () => {
      // Given
      const props = {
        result: {
          summary: {
            notifications: [
              {
                severity: 'WARNING',
                title: 'My xx1 warning',
                description: 'This is xx2 warning',
                position: {
                  offset: 7,
                  line: 1
                },
                code: 'xx3.Warning'
              },
              {
                severity: 'WARNING',
                title: 'My yy1 warning',
                description: 'This is yy2 warning',
                position: {
                  offset: 3,
                  line: 1
                },
                code: 'yy3.Warning'
              }
            ],
            query: {
              text: 'EXPLAIN MATCH zz3'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })

    test('does display multiple warnings for GQL status codes', () => {
      // Given
      const props = {
        result: {
          summary: {
            server: {
              protocolVersion: 5.6
            },
            gqlStatusObjects: [
              {
                severity: 'WARNING',
                gqlStatus: '03N90',
                statusDescription:
                  "info: cartesian product. The disconnected pattern 'p = ()--(), q = ()--()' builds a cartesian product. A cartesian product may produce a large amount of data and slow down query processing.",
                position: {
                  offset: 7,
                  line: 1
                }
              },
              {
                severity: 'WARNING',
                gqlStatus: '01N50',
                statusDescription:
                  'warn: label does not exist. The label `A` does not exist. Verify that the spelling is correct.',
                position: {
                  offset: 3,
                  line: 1
                }
              }
            ],
            query: {
              text: 'MATCH p=()--(), q=()--() RETURN p, q'
            }
          }
        }
      }

      // When
      const { container } = render(<WarningsView {...props} />)

      // Then
      expect(container).toMatchSnapshot()
    })
  })
})
