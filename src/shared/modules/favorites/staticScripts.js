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

export const scripts = [
  {
    folder: 'basics',
    content:
      '// Hello World!\nCREATE (database:Database {name:"Neo4j"})-[r:SAYS]->(message:Message {name:"Hello World!"}) RETURN database, message, r'
  },
  {
    folder: 'basics',
    content: '// Get some data\nMATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25'
  },
  {
    folder: 'basics',
    not_executable: true,
    content:
      "// Create an index\n// Replace:\n//   'LabelName' with label to index\n//   'propertyKey' with property to be indexed\nCREATE INDEX ON :<LabelName>(<propertyKey>)"
  },
  {
    folder: 'basics',
    not_executable: true,
    content:
      "// Create unique property constraint\n// Replace:\n//   'LabelName' with node label\n//   'propertyKey' with property that should be unique\nCREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE"
  },
  {
    folder: 'profile',
    content: '// Count all nodes\nMATCH (n)\nRETURN count(n)'
  },
  {
    folder: 'profile',
    content: '// Count all relationships\nMATCH ()-->() RETURN count(*);'
  },
  {
    folder: 'profile',
    content:
      '// What kind of nodes exist\n// Sample some nodes, reporting on property and relationship counts per node.\nMATCH (n) WHERE rand() <= 0.1\nRETURN\nDISTINCT labels(n),\ncount(*) AS SampleSize,\navg(size(keys(n))) as Avg_PropertyCount,\nmin(size(keys(n))) as Min_PropertyCount,\nmax(size(keys(n))) as Max_PropertyCount,\navg(size( (n)-[]-() ) ) as Avg_RelationshipCount,\nmin(size( (n)-[]-() ) ) as Min_RelationshipCount,\nmax(size( (n)-[]-() ) ) as Max_RelationshipCount'
  },
  {
    folder: 'profile',
    content: '// What is related, and how\nCALL db.schema()'
  },
  {
    folder: 'profile',
    content: '// List node labels\nCALL db.labels()'
  },
  {
    folder: 'profile',
    content: '// List relationship types\nCALL db.relationshipTypes()'
  },
  {
    folder: 'profile',
    content: '// Display constraints and indexes\n:schema'
  },
  {
    folder: 'graphs',
    content: '// Movie Graph\n:play movie-graph'
  },
  {
    folder: 'graphs',
    content: '// Northwind Graph\n:play northwind-graph'
  },
  {
    folder: 'procedures',
    content: '// List procedures\nCALL dbms.procedures()'
  },
  {
    folder: 'procedures',
    content: '// List functions\nCALL dbms.functions()'
  },
  {
    folder: 'procedures',
    content: '// Show meta-graph\nCALL db.schema()'
  },
  {
    folder: 'procedures',
    content: '// List running queries\nCALL dbms.listQueries()'
  },
  {
    folder: 'procedures',
    not_executable: true,
    content:
      '// Wait for index to come online\n// E.g. db.awaitIndex(":Person(name)")\nCALL db.awaitIndex(<param>)'
  },
  {
    folder: 'procedures',
    not_executable: true,
    content:
      '// Schedule resampling of an index\n// E.g. db.resampleIndex(":Person(name)")\nCALL db.resampleIndex(<param>)'
  }
]

export const folders = [
  {
    id: 'basics',
    name: 'Basic Queries',
    isStatic: true
  },
  {
    id: 'graphs',
    name: 'Example Graphs',
    isStatic: true
  },
  {
    id: 'profile',
    name: 'Data Profiling',
    isStatic: true
  },
  {
    id: 'procedures',
    name: 'Common Procedures',
    isStatic: true
  }
]
