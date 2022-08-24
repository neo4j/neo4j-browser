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

export default [
  {
    name: ':help',
    description: ' - learn about other topics',
    commands: [
      { name: 'help' },
      { name: 'commands' },
      { name: 'play' },
      { name: 'server' },
      { name: 'cypher' },
      { name: 'param' },
      { name: 'params' },
      { name: 'queries' },
      { name: 'keys' },
      { name: 'clear' },
      { name: 'bolt' },
      { name: 'bolt-encryption' },
      { name: 'bolt-routing' },
      { name: 'server-user' },
      { name: 'history' },
      { name: 'history clear' },
      { name: 'explain' },
      { name: 'profile' },
      { name: 'match' },
      { name: 'where' },
      { name: 'return' },
      { name: 'create' },
      { name: 'merge' },
      { name: 'delete' },
      { name: 'detach-delete' },
      { name: 'set' },
      { name: 'foreach' },
      { name: 'with' },
      { name: 'load csv' },
      { name: 'unwind' },
      { name: 'start' },
      { name: 'create-unique' },
      { name: 'create-index' },
      { name: 'starts-with' },
      { name: 'ends-with' },
      { name: 'contains' },
      { name: 'rest' },
      { name: 'rest-get' },
      { name: 'rest-put' },
      { name: 'rest-delete' },
      { name: 'rest-post' }
    ]
  },
  {
    name: ':play',
    description:
      ' - loads a mini-deck with either guide material or sample data',
    commands: [
      {
        name: 'start',
        description: ' - where graphs begins'
      },
      {
        name: 'intro',
        description: ' - getting started with Neo4j Browser'
      },
      {
        name: 'concepts',
        description: ' - basic concepts to get you going'
      },
      {
        name: 'cypher',
        description: ' - graph query language introduction'
      },
      {
        name: 'movie graph',
        description: ' - pop-cultural connections between actors and movies'
      },
      {
        name: 'northwind graph',
        description: ' - from RDBMS to Graph, using a classic dataset'
      }
    ]
  },
  {
    name: ':guide',
    description: ' - guides to help you get started',
    commands: [
      {
        name: 'intro',
        description: ' - getting started with Neo4j Browser'
      },
      {
        name: 'concepts',
        description: ' - basic concepts to get you going'
      },
      {
        name: 'cypher',
        description: ' - basics: create, match, delete'
      },
      {
        name: 'movies',
        description:
          '- queries and recommendations with Cypher - movie use case'
      },
      {
        name: 'northwind',
        description: ' - from RDBMS to Graph, using a classic dataset'
      }
    ]
  },
  {
    name: ':server',
    description: ' - manage the connection to Neo4j',
    commands: [
      { name: 'status' },
      { name: 'change-password' },
      { name: 'connect' },
      { name: 'disconnect' },
      {
        name: 'user',
        description: ' - user management for administrators',
        commands: [{ name: 'add' }, { name: 'list' }]
      }
    ]
  },
  {
    name: ':param',
    description: ' - define a parameter'
  },
  {
    name: ':params',
    description: ' - show you a list of all your current parameters'
  },
  {
    name: ':queries',
    description: ' - list your servers and clusters running queries'
  },
  {
    name: ':sysinfo',
    description: ' - system information'
  },
  {
    name: ':clear',
    description: ' - remove all frames from the stream'
  },
  {
    name: ':config'
  },
  {
    name: ':schema',
    description: ' - display indexes and constraints'
  },
  {
    name: ':history',
    description: ' - display your most recent executed commands'
  },
  {
    name: ':get',
    description: " - send HTTP GET to Neo4j's REST interface"
  },
  {
    name: ':post',
    description: " - send HTTP POST to Neo4j's REST interface"
  },
  {
    name: ':put',
    description: " - send HTTP PUT to Neo4j's REST interface"
  },
  {
    name: ':delete',
    description: " - send HTTP DELETE to Neo4j's REST interface"
  },
  {
    name: ':head',
    description: " - send HTTP HEAD to Neo4j's REST interface"
  },
  {
    name: ':style'
  }
]
