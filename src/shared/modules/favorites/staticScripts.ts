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

export const scripts = [
  {
    folder: 'basics',
    content: '// Connect to DBMS\n:server connect',
    versionRange: '0.0.0'
  },
  {
    folder: 'basics',
    content:
      '// Hello World!\nCREATE (database:Database {name:"Neo4j"})-[r:SAYS]->(message:Message {name:"Hello World!"}) RETURN database, message, r',
    versionRange: '>=3'
  },
  {
    folder: 'basics',
    content: '// Get some data\nMATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25',
    versionRange: '>=3'
  },
  {
    folder: 'basics',
    not_executable: true,
    content: `// Create an index
// Replace:
//   'LabelName' with label to index
//   'propertyKey' with property to be indexed
CREATE INDEX ON :<LabelName>(<propertyKey>)`,
    versionRange: '>=3 <4'
  },
  {
    folder: 'basics',
    not_executable: true,
    content: `// Create an index
// Replace:
//   'IndexName' with name of index (optional)
//   'LabelName' with label to index
//   'propertyName' with property to be indexed
CREATE INDEX [IndexName] 
FOR (n:LabelName)
ON (n.propertyName)
`,
    versionRange: '>=4'
  },
  {
    folder: 'basics',
    not_executable: true,
    content: `// Create unique property constraint
// Replace:
//   'LabelName' with node label
//   'propertyKey' with property that should be unique
CREATE CONSTRAINT ON (n:<LabelName>) ASSERT n.<propertyKey> IS UNIQUE`,
    versionRange: '>=3 <4.4'
  },
  {
    folder: 'basics',
    not_executable: true,
    content: `// Create unique property constraint
// Replace:
//   'ConstraintName' with name of constraint (optional)
//   'LabelName' with node label
//   'propertyKey' with property that should be unique
CREATE CONSTRAINT [ConstraintName]
FOR (n:<LabelName>)
REQUIRE n.<propertyKey> IS UNIQUE`,
    versionRange: '>=4.4'
  },
  {
    folder: 'profile',
    content: '// Count all nodes\nMATCH (n)\nRETURN count(n)',
    versionRange: '>=3'
  },
  {
    folder: 'profile',
    content: '// Count all relationships\nMATCH ()-->() RETURN count(*);',
    versionRange: '>=3'
  },
  {
    folder: 'profile',
    content:
      '// What kind of nodes exist\n// Sample some nodes, reporting on property and relationship counts per node.\nMATCH (n) WHERE rand() <= 0.1\nRETURN\nDISTINCT labels(n),\ncount(*) AS SampleSize,\navg(size(keys(n))) as Avg_PropertyCount,\nmin(size(keys(n))) as Min_PropertyCount,\nmax(size(keys(n))) as Max_PropertyCount,\navg(size( (n)-[]-() ) ) as Avg_RelationshipCount,\nmin(size( (n)-[]-() ) ) as Min_RelationshipCount,\nmax(size( (n)-[]-() ) ) as Max_RelationshipCount',
    versionRange: '>=3'
  },
  {
    folder: 'profile',
    content: '// What is related, and how\nCALL db.schema.visualization()',
    versionRange: '>=4'
  },
  {
    folder: 'profile',
    content: '// What is related, and how\nCALL db.schema()',
    versionRange: '>=3 <4'
  },
  {
    folder: 'profile',
    content: '// List node labels\nCALL db.labels()',
    versionRange: '>=3'
  },
  {
    folder: 'profile',
    content: '// List relationship types\nCALL db.relationshipTypes()',
    versionRange: '>=3'
  },
  {
    folder: 'profile',
    content: '// Display constraints and indexes\n:schema',
    versionRange: '>=3'
  },
  {
    folder: 'graphs',
    content: '// Movie Graph\n:play movie-graph',
    versionRange: '>=3'
  },
  {
    folder: 'graphs',
    content: '// Northwind Graph\n:play northwind-graph',
    versionRange: '>=3'
  },
  {
    folder: 'procedures',
    content: '// List procedures\nCALL dbms.procedures()',
    versionRange: '>=3 <5'
  },
  {
    folder: 'procedures',
    content: '// List procedures\nSHOW PROCEDURES',
    versionRange: '>=5'
  },
  {
    folder: 'procedures',
    content: '// List functions\nCALL dbms.functions()',
    versionRange: '>=3 <5'
  },
  {
    folder: 'procedures',
    content: '// List functions\nSHOW FUNCTIONS',
    versionRange: '>=5'
  },
  {
    folder: 'procedures',
    content: '// Show meta-graph\nCALL db.schema.visualization()',
    versionRange: '>=4'
  },
  {
    folder: 'procedures',
    content: '// Show meta-graph\nCALL db.schema()',
    versionRange: '>=3 <4'
  },
  {
    folder: 'procedures',
    content: '// List running queries\nCALL dbms.listQueries()',
    versionRange: '>=3'
  },
  {
    folder: 'procedures',
    not_executable: true,
    content:
      '// Wait for index to come online\n// E.g. db.awaitIndex(":Person(name)")\nCALL db.awaitIndex(<param>)',
    versionRange: '>=3'
  },
  {
    folder: 'procedures',
    not_executable: true,
    content:
      '// Schedule resampling of an index\n// E.g. db.resampleIndex(":Person(name)")\nCALL db.resampleIndex(<param>)',
    versionRange: '>=3'
  }
]

export const folders = [
  {
    id: 'basics',
    name: 'Basic Queries',
    isStatic: true,
    versionRange: ''
  },
  {
    id: 'graphs',
    name: 'Example Graphs',
    isStatic: true,
    versionRange: ''
  },
  {
    id: 'profile',
    name: 'Data Profiling',
    isStatic: true,
    versionRange: ''
  },
  {
    id: 'procedures',
    name: 'Common Procedures',
    isStatic: true,
    versionRange: ''
  }
]
