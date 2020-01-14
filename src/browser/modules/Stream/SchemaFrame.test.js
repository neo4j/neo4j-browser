/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import React from 'react'
import { render } from '@testing-library/react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { SchemaFrame } from './SchemaFrame'

function renderWithRedux(children) {
  return render(
    <Provider store={createStore(() => ({}), {})}>{children}</Provider>
  )
}

test('SchemaFrame renders empty', () => {
  const indexResult = { records: [] }
  const { container } = renderWithRedux(
    <SchemaFrame indexes={indexResult} neo4jVersion={null} />
  )

  expect(container).toMatchSnapshot()
})

test('SchemaFrame renders empty for Neo4j >= 4.0', () => {
  const indexResult = { records: [] }
  const { container } = renderWithRedux(
    <SchemaFrame indexes={indexResult} neo4jVersion={'4.0.0-rc1'} />
  )

  expect(container).toMatchSnapshot()
})

test('SchemaFrame renders results for Neo4j < 4.0', () => {
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
  const firstIndexRecord = indexResult.result.records[0]
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
  const firstConstraintRecord = constraintResult.result.records[0]
  firstConstraintRecord.get = key =>
    firstConstraintRecord._fields[firstConstraintRecord.keys.indexOf(key)]

  const { container } = renderWithRedux(
    <SchemaFrame
      indexes={indexResult}
      constraints={constraintResult}
      neo4jVersion={'3.5.13'}
    />
  )

  expect(container).toMatchSnapshot()
})

test('SchemaFrame renders correct suggestion for Neo4j > 3.4', () => {
  const indexResult = { records: [] }
  const { getByText } = renderWithRedux(
    <SchemaFrame indexes={indexResult} neo4jVersion={'3.5.1'} />
  )

  expect(getByText('CALL db.schema.visualization')).not.toBeNull()
})

test('SchemaFrame renders correct suggestion for Neo4j <= 3.4', () => {
  const indexResult = { records: [] }
  const { getByText } = renderWithRedux(
    <SchemaFrame indexes={indexResult} neo4jVersion={'3.4.1'} />
  )

  expect(getByText('CALL db.schema()')).not.toBeNull()
})
