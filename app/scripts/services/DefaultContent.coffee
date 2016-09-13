###!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

'use strict';

angular.module('neo4jApp.services')
.service('DefaultContentService', [
  'Document'
  'Folder'
    (Document, Folder) ->
      basic_scripts = [
        {
          folder: 'basics'
          content: """
// Query Template
:play query-template
          """
        }
        {
          folder: 'basics'
          content: """
  // Hello World!
  CREATE (n {name:"World"}) RETURN "hello", n.name
          """
        }
        {
          folder: 'basics'
          content: """
  // Create an index
  // Replace:
  //   'LabelName' with label to index
  //   'propertyKey' with property to be indexed
  CREATE INDEX ON :LabelName(propertyKey)
          """
        }
        {
          folder: 'basics'
          content: """
  // Create unique property constraint
  // Replace:
  //   'LabelName' with node label
  //   'propertyKey' with property that should be unique
  CREATE CONSTRAINT ON (n:LabelName) ASSERT n.propertyKey IS UNIQUE
          """
        }
        {
          folder: 'basics'
          content: """
  // Get some data
  MATCH (n) OPTIONAL MATCH (n)-[r]-() RETURN n,r LIMIT 100
          """
        }
      ]

      profile_scripts = [
        {
          folder: 'profile'
          content: """
  // Count all nodes
  MATCH (n)
  RETURN count(n)
          """
        }
        {
          folder: 'profile'
          content: """
// Count all relationships
MATCH ()-->() RETURN count(*);
          """
        }
        {
          folder: 'profile'
          content: """
// What kind of nodes exist
// Sample some nodes, reporting on property and relationship counts per node.
MATCH (n) WHERE rand() <= 0.1
RETURN
DISTINCT labels(n),
count(*) AS SampleSize,
avg(size(keys(n))) as Avg_PropertyCount,
min(size(keys(n))) as Min_PropertyCount,
max(size(keys(n))) as Max_PropertyCount,
avg(size( (n)-[]-() ) ) as Avg_RelationshipCount,
min(size( (n)-[]-() ) ) as Min_RelationshipCount,
max(size( (n)-[]-() ) ) as Max_RelationshipCount
          """
        }
        {
          folder: 'profile'
          content: """
// What is related, and how
// Sample the graph, reporting the patterns of connected labels,
// with min, max, avg degrees and associated node and relationship properties.
MATCH (n) where rand() <= 0.1
MATCH (n)-[r]->(m)
WITH n, type(r) as via, m
RETURN labels(n) as from,
   reduce(keys = [], keys_n in collect(keys(n)) | keys + filter(k in keys_n WHERE NOT k IN keys)) as props_from,
   via,
   labels(m) as to,
   reduce(keys = [], keys_m in collect(keys(m)) | keys + filter(k in keys_m WHERE NOT k IN keys)) as props_to,
   count(*) as freq
          """
        }
      ]

      example_graphs = [
        {
          folder: 'graphs'
          content: """
// Movie Graph
:play movie-graph
          """
        }
        {
          folder: 'graphs'
          content: """
// Northwind Graph
:play northwind-graph
          """
        }
      ]

      system_scripts = [
        {
          folder: 'system'
          content: """
  // Server configuration
  :GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DConfiguration
          """
        }
        {
          folder: 'system'
          content: """
  // Kernel information
  :GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DKernel
          """
        }
        {
          folder: 'system'
          content: """
  // ID Allocation
  :GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DPrimitive%20count
          """
        }
        {
          folder: 'system'
          content: """
  // Store file sizes
  :GET /db/manage/server/jmx/domain/org.neo4j/instance%3Dkernel%230%2Cname%3DStore%20file%20sizes
          """
        }
        {
          folder: 'system'
          content: """
  // Extensions
  :GET /db/data/ext
          """
        }
      ]
      procedure_scripts = [
        {
          folder: 'procedures'
          content: """
  // List procedures
  CALL dbms.procedures()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List labels
  CALL db.labels()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List relationship types
  CALL db.relationshipTypes()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List properties keys
  CALL db.propertyKeys()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List indexes
  CALL db.indexes()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List constraints
  CALL db.constraints()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List components
  CALL dbms.components()
          """
        }
        {
          folder: 'procedures'
          content: """
  // Show current user
  CALL dbms.security.showCurrentUser()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List users
  CALL dbms.security.listUsers()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List connectionss
  CALL dbms.security.listConnections()
          """
        }
        {
          folder: 'procedures'
          content: """
  // List transactions
  CALL dbms.security.listTransactions()
          """
        }
      ]


      class DefaultContent
        constructor: ->
        getDefaultDocuments: ->
          basic_scripts.concat example_graphs.concat profile_scripts.concat system_scripts
        resetToDefault: ->
          Document.reset()
        loadDefaultIfEmpty: ->
          [
            {
              id: "basics"
              name: "Basic Queries"
              expanded: no
              documents: basic_scripts
            }
            {
              id: 'graphs'
              name: "Example Graphs"
              expanded: no
              documents: example_graphs
            }
            {
              id: "profile"
              name: "Data Profiling"
              expanded: no
              documents: profile_scripts
            }
            {
              id: "system"
              name: "System"
              expanded: no
              documents: system_scripts
            }
            {
              id: "procedures"
              name: "Common Procedures"
              expanded: no
              documents: procedure_scripts
            }
          ]
      new DefaultContent
])
