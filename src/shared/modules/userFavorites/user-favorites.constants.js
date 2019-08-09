/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

export const STATE_NAME = 'user-favorites'

export const LOCAL_STORAGE_NAMESPACE = `neo4j/${STATE_NAME}`

export const BROWSER_FAVORITES_NAMESPACE = '/neo4j-browser/'
export const BROWSER_STATIC_SCRIPTS_NAMESPACE = '/static-scripts/'
export const SYNC_VERSION_HISTORY_SIZE = 20
export const CYPHER_FILE_EXTENSION = '.cypher'

export const STATIC_SCRIPTS = [
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Basic Queries`,
    contents:
      '// Hello World!\nCREATE (database:Database {name:"Neo4j"})-[r:SAYS]->(message:Message {name:"Hello World!"}) RETURN database, message, r'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Basic Queries`,
    contents: '// Get some data\nMATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Basic Queries`,
    isSuggestion: true,
    contents:
      "// Create an index\n// Replace:\n//   'LabelName' with label to index\n//   'propertyKey' with property to be indexed\nCREATE INDEX ON :<LabelName>(<propertyKey>)"
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Basic Queries`,
    isSuggestion: true,
    contents:
      "// Create unique property constraint\n// Replace:\n//   'LabelName' with node label\n//   'propertyKey' with property that should be unique\nCREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE"
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// Count all nodes\nMATCH (n)\nRETURN count(n)'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// Count all relationships\nMATCH ()-->() RETURN count(*);'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents:
      '// What kind of nodes exist\n// Sample some nodes, reporting on property and relationship counts per node.\nMATCH (n) WHERE rand() <= 0.1\nRETURN\nDISTINCT labels(n),\ncount(*) AS SampleSize,\navg(size(keys(n))) as Avg_PropertyCount,\nmin(size(keys(n))) as Min_PropertyCount,\nmax(size(keys(n))) as Max_PropertyCount,\navg(size( (n)-[]-() ) ) as Avg_RelationshipCount,\nmin(size( (n)-[]-() ) ) as Min_RelationshipCount,\nmax(size( (n)-[]-() ) ) as Max_RelationshipCount'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// What is related, and how\nCALL db.schema()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// List node labels\nCALL db.labels()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// List relationship types\nCALL db.relationshipTypes()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Data Profiling`,
    contents: '// Display constraints and indexes\n:schema'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Example Graphs`,
    contents: '// Movie Graph\n:play movie-graph'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Example Graphs`,
    contents: '// Northwind Graph\n:play northwind-graph'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    contents: '// List procedures\nCALL dbms.procedures()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    contents: '// List functions\nCALL dbms.functions()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    contents: '// Show meta-graph\nCALL db.schema()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    contents: '// List running queries\nCALL dbms.listQueries()'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    isSuggestion: true,
    contents:
      '// Wait for index to come online\n// E.g. db.awaitIndex(":Person(name)")\nCALL db.awaitIndex(<param>)'
  },
  {
    path: `${BROWSER_STATIC_SCRIPTS_NAMESPACE}Common Procedures`,
    isSuggestion: true,
    contents:
      '// Schedule resampling of an index\n// E.g. db.resampleIndex(":Person(name)")\nCALL db.resampleIndex(<param>)'
  }
]
