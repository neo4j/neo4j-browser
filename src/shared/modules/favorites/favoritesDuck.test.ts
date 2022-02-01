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
import uuid from 'uuid'

import reducer, * as favorites from './favoritesDuck'

describe('favorites reducer', () => {
  test('should allow id to be injected when adding a favorite', () => {
    const nextState = reducer([], favorites.addFavorite('bar', 'foo'))
    expect(nextState.length).toBe(1)

    const actual = nextState[0]
    expect(actual.id).toEqual('foo')
    expect(actual.content).toEqual('bar')
  })
  test('should generate an id when adding a favorite and only passing cmd value', () => {
    const nextState = reducer([], favorites.addFavorite('bar'))
    expect(nextState.length).toBe(1)

    const actual = nextState[0]
    expect(actual.id).not.toBeFalsy()
    expect(actual.content).toEqual('bar')
  })

  test('should update state for favorites when favorite is removed and only one item is in the list', () => {
    const nextState = reducer(
      [{ id: 'a', content: 'foo' }],
      favorites.removeFavorites(['a'])
    )
    expect(nextState).toEqual([])
  })

  test('should update state for favorites when favorite is removed when there is more than one item in the list', () => {
    const favoriteScript1 = {
      id: uuid.v4(),
      content: 'match (n) return n limit 1'
    }
    const favoriteScript2 = {
      id: uuid.v4(),
      content: 'match (a) return a'
    }
    const favoriteScript3 = {
      id: uuid.v4(),
      content: 'match (a) return a'
    }
    const initialState = [favoriteScript1, favoriteScript2, favoriteScript3]
    const nextState = reducer(
      initialState,
      favorites.removeFavorite(favoriteScript2.id)
    )
    expect(nextState).toEqual([favoriteScript1, favoriteScript3])
  })
  test('should return favorite by id', () => {
    const script = {
      id: uuid.v4(),
      content: 'match (n) return n limit 1'
    }

    const nextState = reducer([script], favorites.addFavorite('foo', 'b'))
    expect(favorites.getFavorite(nextState, script.id)).toEqual(script)
    expect(favorites.getFavorite(nextState, 'b')).toEqual({
      id: 'b',
      content: 'foo'
    })
  })
  test('should update favorite by id', () => {
    const favoriteScript1 = {
      id: uuid.v4(),
      content: 'match (n) return n limit 1'
    }
    const favoriteScript2 = {
      id: uuid.v4(),
      content: 'match (a) return a'
    }
    const initialState = [favoriteScript1, favoriteScript2]
    const newContent = '//Foobar'
    const nextState = reducer(
      initialState,
      favorites.updateFavoriteContent(favoriteScript1.id, newContent)
    )
    expect(favorites.getFavorite(nextState, favoriteScript1.id)).toEqual({
      ...favoriteScript1,
      content: newContent
    })
    expect(favorites.getFavorite(nextState, favoriteScript2.id)).toEqual(
      favoriteScript2
    )
  })
})

describe('favorites actions', () => {
  test('should handle loading favorites', () => {
    const favs = [{ id: 'abc', content: 'abc' }]
    const expected = {
      type: favorites.LOAD_FAVORITES,
      favorites: favs
    }
    expect(favorites.loadFavorites(favs)).toEqual(expected)
  })
  test('should handle removing favorite', () => {
    const id = uuid.v4()
    const expected = {
      type: favorites.REMOVE_FAVORITE,
      id
    }
    expect(favorites.removeFavorite(id)).toEqual(expected)
  })
})
describe('loadFavoritesFromStorage', () => {
  it('handles missing stored data', () => {
    expect(favorites.loadFavoritesFromStorage(undefined)).toEqual(
      favorites.initialState
    )
  })
  it('handles non list stored data types', () => {
    expect(favorites.loadFavoritesFromStorage({ tes: 23 })).toEqual(
      favorites.initialState
    )
    expect(favorites.loadFavoritesFromStorage('fav')).toEqual(
      favorites.initialState
    )
  })
  it('handles proper stored user data', () => {
    const basicFav = { content: 'fav content' }
    expect(favorites.loadFavoritesFromStorage([basicFav])).toEqual([
      ...favorites.initialState,
      basicFav
    ])
  })
  it('drops static favorites', () => {
    const basicFav = { content: 'fav content' }
    const staticFav = { isStatic: true, content: 'content' }
    expect(
      favorites.loadFavoritesFromStorage([
        ...favorites.initialState,
        ...favorites.initialState,
        staticFav,
        basicFav
      ])
    ).toEqual([...favorites.initialState, basicFav])
  })
  it('handle a real life store', () => {
    const data = [
      {
        folder: 'basics',
        content: '// Connect to DBMS\n:server connect',
        versionRange: '0.0.0',
        isStatic: true
      },
      {
        folder: 'basics',
        content:
          '// Hello World!\nCREATE (database:Database {name:"Neo4j"})-[r:SAYS]->(message:Message {name:"Hello World!"}) RETURN database, message, r',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'basics',
        content:
          '// Get some data\nMATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'basics',
        not_executable: true,
        content:
          "// Create an index\n// Replace:\n//   'LabelName' with label to index\n//   'propertyKey' with property to be indexed\nCREATE INDEX ON :<LabelName>(<propertyKey>)",
        versionRange: '>=3 <4',
        isStatic: true
      },
      {
        folder: 'basics',
        not_executable: true,
        content:
          "// Create an index\n// Replace:\n//   'IndexName' with name of index (optional)\n//   'LabelName' with label to index\n//   'propertyName' with property to be indexed\nCREATE INDEX [IndexName] \nFOR (n:LabelName)\nON (n.propertyName)\n",
        versionRange: '>=4',
        isStatic: true
      },
      {
        folder: 'basics',
        not_executable: true,
        content:
          "// Create unique property constraint\n// Replace:\n//   'LabelName' with node label\n//   'propertyKey' with property that should be unique\nCREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE",
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// Count all nodes\nMATCH (n)\nRETURN count(n)',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// Count all relationships\nMATCH ()-->() RETURN count(*);',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content:
          '// What kind of nodes exist\n// Sample some nodes, reporting on property and relationship counts per node.\nMATCH (n) WHERE rand() <= 0.1\nRETURN\nDISTINCT labels(n),\ncount(*) AS SampleSize,\navg(size(keys(n))) as Avg_PropertyCount,\nmin(size(keys(n))) as Min_PropertyCount,\nmax(size(keys(n))) as Max_PropertyCount,\navg(size( (n)-[]-() ) ) as Avg_RelationshipCount,\nmin(size( (n)-[]-() ) ) as Min_RelationshipCount,\nmax(size( (n)-[]-() ) ) as Max_RelationshipCount',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// What is related, and how\nCALL db.schema.visualization()',
        versionRange: '>=4',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// What is related, and how\nCALL db.schema()',
        versionRange: '>=3 <4',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// List node labels\nCALL db.labels()',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// List relationship types\nCALL db.relationshipTypes()',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'profile',
        content: '// Display constraints and indexes\n:schema',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'graphs',
        content: '// Movie Graph\n:play movie-graph',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'graphs',
        content: '// Northwind Graph\n:play northwind-graph',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'procedures',
        content: '// List procedures\nCALL dbms.procedures()',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'procedures',
        content: '// List functions\nCALL dbms.functions()',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'procedures',
        content: '// Show meta-graph\nCALL db.schema.visualization()',
        versionRange: '>=4',
        isStatic: true
      },
      {
        folder: 'procedures',
        content: '// Show meta-graph\nCALL db.schema()',
        versionRange: '>=3 <4',
        isStatic: true
      },
      {
        folder: 'procedures',
        content: '// List running queries\nCALL dbms.listQueries()',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'procedures',
        not_executable: true,
        content:
          '// Wait for index to come online\n// E.g. db.awaitIndex(":Person(name)")\nCALL db.awaitIndex(<param>)',
        versionRange: '>=3',
        isStatic: true
      },
      {
        folder: 'procedures',
        not_executable: true,
        content:
          '// Schedule resampling of an index\n// E.g. db.resampleIndex(":Person(name)")\nCALL db.resampleIndex(<param>)',
        versionRange: '>=3',
        isStatic: true
      },
      {
        id: 'fab1039a-e1f8-44d7-9556-af80ebc62637',
        content:
          'match (n) return labels(n) as type, count(n) as count order by count desc union match ()-[r]->() return type(r) as type, count(r) as count order by count desc'
      },
      {
        id: '8d9c21a1-2c42-4f51-a5ad-fe1d23516372',
        content:
          'CALL db.labels() YIELD label\nCALL apoc.cypher.run(\'MATCH (:`\'+label+\'`) RETURN count(*) as count\',{}) YIELD value\nRETURN "(:"+ label + ")" as type, apoc.number.format(value.count) as cnt order by value.count desc\nUNION\nCALL db.relationshipTypes() YIELD relationshipType as type\nCALL apoc.cypher.run(\'MATCH ()-[:`\'+type+\'`]->() RETURN count(*) as count\',{}) YIELD value\nRETURN "[" + type + "]" as type, apoc.number.format(value.count) as cnt order by value.count desc'
      },
      {
        id: '9b662d36-2e72-4b8b-83e8-ac3b70d52260',
        content: 'call gds.graph.create("followers", "User", "FOLLOWS")',
        folder: 'b64ccdaf-ad44-47c1-bb74-768f5dccc1b8'
      },
      {
        id: '379e4c60-1812-485b-8e54-f5c7d5ce7bb4',
        content:
          'call gds.pageRank.write("followers", {writeProperty: "pageRanke"})',
        folder: 'b64ccdaf-ad44-47c1-bb74-768f5dccc1b8'
      },
      {
        id: '6f871d75-2632-426f-842c-d4a2c2605b30',
        content:
          'call gds.louvain.write("followers", {writeProperty: "louvain"})',
        folder: 'b64ccdaf-ad44-47c1-bb74-768f5dccc1b8'
      },
      {
        id: 'ac8260ae-66c4-42cb-9c68-20284e3d67d5',
        content:
          'call gds.labelPropagation.write("followers", {writeProperty: "lpa"})',
        folder: 'b64ccdaf-ad44-47c1-bb74-768f5dccc1b8'
      }
    ]

    expect(favorites.loadFavoritesFromStorage(data)).toEqual(data)
  })
})
