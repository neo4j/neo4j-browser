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
import * as convert from './editorSchemaConverter'

describe('editor meta to schema conversion', () => {
  test('convert meta label', () => {
    expect(convert.toLabel('label')).toEqual(':label')
  })

  test('convert meta relationship', () => {
    expect(convert.toRelationshipType('relType')).toEqual(':relType')
  })

  test('convert meta function', () => {
    expect(
      convert.toFunction({
        name: 'ns.functionName',
        signature: 'ns.functionName() :: (STRING?)'
      })
    ).toEqual({
      name: 'ns.functionName',
      signature: '() :: (STRING?)'
    })
  })

  test('convert meta procedure with void return items', () => {
    expect(
      convert.toProcedure({
        name: 'db.createLabel',
        signature: 'db.createLabel(newLabel :: STRING?) :: VOID'
      })
    ).toEqual({
      name: 'db.createLabel',
      signature: '(newLabel :: STRING?) :: VOID',
      returnItems: []
    })
  })

  test('convert meta procedure with single return item', () => {
    expect(
      convert.toProcedure({
        name: 'db.constraints',
        signature: 'db.constraints() :: (description :: STRING?)'
      })
    ).toEqual({
      name: 'db.constraints',
      signature: '() :: (description :: STRING?)',
      returnItems: [{ name: 'description', signature: 'STRING?' }]
    })
  })

  test('convert meta procedure with multiple return items', () => {
    expect(
      convert.toProcedure({
        name: 'db.indexes',
        signature:
          'db.indexes() :: (description :: STRING?, state :: STRING?, type :: STRING?)'
      })
    ).toEqual({
      name: 'db.indexes',
      signature:
        '() :: (description :: STRING?, state :: STRING?, type :: STRING?)',
      returnItems: [
        { name: 'description', signature: 'STRING?' },
        { name: 'state', signature: 'STRING?' },
        { name: 'type', signature: 'STRING?' }
      ]
    })
  })
})
