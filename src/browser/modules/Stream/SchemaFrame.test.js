/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

/* global describe, test, expect */

import React from 'react'
import { render } from 'react-testing-library'

import { SchemaFrame } from './SchemaFrame'

test('SchemaFrame renders empty', () => {
  const indexResult = { records: [] }
  const { container } = render(<SchemaFrame indexes={indexResult} />)

  expect(container).toMatchSnapshot()
})

test('SchemaFrame renders with result', () => {
  const indexResult = {
    success: true,
    result: {
      records: [
        {
          _fields: [
            'INDEX ON :Movie(released)',
            'Movie',
            ['released'],
            'ONLINE',
            'node_label_property',
            {
              version: '2.0',
              key: 'lucene+native'
            }
          ],
          keys: [
            'description',
            'label',
            'properties',
            'state',
            'type',
            'provider'
          ]
        }
      ]
    }
  }
  let firstIndexRecord = indexResult.result.records[0]
  firstIndexRecord.get = key =>
    firstIndexRecord._fields[firstIndexRecord.keys.indexOf(key)]

  const constraintResult = {
    success: true,
    result: {
      records: [
        {
          keys: ['description'],
          _fields: ['CONSTRAINT ON ( book:Book ) ASSERT book.isbn IS UNIQUE']
        }
      ]
    }
  }
  let firstConstraintRecord = constraintResult.result.records[0]
  firstConstraintRecord.get = key =>
    firstConstraintRecord._fields[firstConstraintRecord.keys.indexOf(key)]

  const { container } = render(
    <SchemaFrame indexes={indexResult} constraints={constraintResult} />
  )

  expect(container).toMatchSnapshot()
})
