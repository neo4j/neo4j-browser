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
  .factory 'Bolt', [
    'Settings'
    (Settings) ->
      bolt = window.neo4j.v1
      driver = bolt.driver("bolt://localhost:7687")

      boltResultToRESTResult = (res) ->
        obj = {
          config: {},
          headers: -> [],
          data: {results: [{columns: [], data: []}], errors: []}
        }
        if res.fields
          obj.data.errors = res.fields
          return obj
        return obj if not res[0]  
        keys = Object.keys(res[0])
        obj.data.results[0].columns = keys
        res = itemIntToString res
        rows = res.map((record) ->
          return {
            row: getRESTRowsFromBolt record, keys
            graph: getRESTGraphFromBolt record, keys
          }
        )
        obj.data.results[0]['data'] = rows
        return obj

      getRESTRowsFromBolt = (record, keys) ->
        keys.reduce((tot, curr)->
          col = if typeof record[curr]['identity'] isnt 'undefined' then record[curr].properties else record[curr]
          tot.concat col
        , [])

      getRESTGraphFromBolt = (record, keys) ->
        items = keys.map((key) -> record[key])
        graphItems = items.filter((item) -> typeof item['identity'] isnt 'undefined')
          .map((item) -> 
            item.id = item.identity
            delete item.identity
            Object.keys
            return item
          )
        nodes = graphItems.filter((item) -> typeof item['labels'] isnt 'undefined')
        rels = graphItems.filter((item) -> typeof item['type'] isnt 'undefined')
          .map((item) ->
            item.startNode = item.start
            item.endNode = item.end 
            delete item.start
            delete item.end
            return item
          )
        {nodes: nodes, relationships: rels}

      itemIntToString = (item) ->
        return arrayIntToString item if Array.isArray(item)
        return item if typeof item in ['number', 'string']
        return item if item is null
        return item.toString() if bolt.isInt item
        return objIntToString item if typeof item is 'object'

      arrayIntToString = (arr) ->
       arr.map((item) -> itemIntToString item)

      objIntToString = (obj) ->
        outObj = {}
        Object.keys(obj).forEach((key) ->
          outObj[key] = itemIntToString obj[key]
        )
        outObj

      return {
        beginTransaction: (opts) -> 
          statement = opts[0]?.statement || ''
          tx = driver.session().beginTransaction()
          return {tx: tx, promise: null} unless statement
          return {tx: tx, promise: tx.run(statement)}
        transaction: (opts, tx) -> 
          tx = tx || driver.session().beginTransaction()
          statement = opts[0]?.statement || ''
          p = tx.run(opts[0].statement)
          tx.commit()
          {tx: tx, promise: p}
        constructResult: (res) ->
          boltResultToRESTResult res
      }
  ]
