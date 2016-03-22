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
    'AuthDataService'
    'localStorageService'
    '$rootScope'
    '$q'
    (Settings, AuthDataService, localStorageService, $rootScope, $q) ->
      bolt = window.neo4j.v1
      _driver = null

      connect = (withoutCredentials) ->
        q = $q.defer()
        authData = AuthDataService.getPlainAuthData()
        [_m, username, password] = if authData then authData.match(/^([^:]+):(.*)$/) else ['','','']
        if withoutCredentials
          _driver = bolt.driver("bolt://localhost:7687")
        else
          _driver = bolt.driver("bolt://localhost:7687", bolt.auth.basic(username, password))
        _driver.onError = (e) -> 
          if e instanceof Event and e.type is 'error'
            _driver = null 
            q.reject getSocketErrorObj()
        session = createSession()
        p = session.run("CALL db.labels")
        p.then((r) ->
          session.close()
          q.resolve r
        ).catch((e)-> 
          session.close()
          q.reject e
        )
        q.promise

      createSession = () ->
        return _driver.session() if _driver
        return no

      beginTransaction = (opts) ->
        q = $q.defer()
        statement = opts[0]?.statement || ''
        session = createSession()
        if not session
          tx = null
          q.reject getSocketErrorObj()
        else
          tx = session.beginTransaction()
          q.resolve() unless statement
          tx.run(statement).then((r)-> q.resolve(r)).catch((e)-> q.reject(e)) if statement
        return {tx: tx, session: session, promise: q.promise}

      transaction = (opts, session, tx) -> 
        statement = opts[0]?.statement || ''
        q = $q.defer()
        session = session || createSession()
        if not session
          q.reject getSocketErrorObj()
        else
          if tx
            p = tx.run statement
            tx.commit()
          else
            p = session.run statement  
          p.then((r) ->
            session.close()
            q.resolve r
          ).catch((e) -> 
            session.close()
            q.reject e
          )
        {tx: tx, promise: q.promise}

      metaResultToRESTResult = (labels, realtionshipTypes, propertyKeys) ->
        labels: labels.map (o) -> o.label
        relationships: realtionshipTypes.map (o) -> o.relationshipType
        propertyKeys:  propertyKeys.map (o) -> o.propertyKey

      boltResultToRESTResult = (result) ->
        res = result.records || []
        obj = {
          config: {},
          headers: -> [],
          data: {
            results: [{
              columns: [],
              data: [],
              stats: {},
              }],
            notifications: (if result.summary && result.summary.notifications then result.summary.notifications else []),
            errors: []
          }
        }
        if result.fields
          obj.data.errors = result.fields
          return obj
        keys = if res.length then Object.keys(res[0]) else []
        obj.data.results[0].columns = keys
        obj.data.results[0].plan = boltPlanToRESTPlan result.summary.plan if result.summary and result.summary.plan
        obj.data.results[0].plan = boltPlanToRESTPlan result.summary.profile if result.summary and result.summary.profile
        obj.data.results[0].stats = boltStatsToRESTStats result.summary
        res = itemIntToString res
        rows = res.map((record) ->
          return {
            row: getRESTRowsFromBolt record, keys
            meta: getRESTMetaFromBolt record, keys
            graph: getRESTGraphFromBolt record, keys
          }
        )
        obj.data.results[0]['data'] = rows
        return obj

      getRESTRowsFromBolt = (record, keys) ->
        keys.reduce((tot, curr) -> 
          res = extractDataForRowsFormat(record[curr])
          res = [res] if Array.isArray res
          tot.concat res
        , [])

      getRESTMetaFromBolt = (record, keys) ->
        items = keys.map((key) -> record[key])
        items.map((item) ->
          type = 'node' if item instanceof bolt.types.Node
          type = 'relationship' if item instanceof bolt.types.Relationship
          return {id: item.identity, type: type} if type
          null
        )

      getRESTGraphFromBolt = (record, keys) ->
        items = keys.map((key) -> record[key])
        graphItems = [].concat.apply([],  extractDataForGraphFormat(items))
        graphItems.map((item) ->
          item.id = item.identity
          delete item.identity
          return item
        )
        nodes = graphItems.filter((item) -> item instanceof bolt.types.Node)
        rels = graphItems.filter((item) -> item instanceof bolt.types.Relationship)
          .map((item) ->
            item.startNode = item.start
            item.endNode = item.end
            delete item.start
            delete item.end
            return item
          )
        {nodes: nodes, relationships: rels}

      extractDataForRowsFormat = (item) ->
        return item.properties if item instanceof bolt.types.Node
        return item.properties if item instanceof bolt.types.Relationship
        return extractPathForRowsFormat item if item instanceof bolt.types.Path
        return item if item is null
        return item.map((subitem) -> extractDataForRowsFormat subitem) if Array.isArray item
        if typeof item is 'object'
          out = {}
          Object.keys(item).forEach((key) => out[key] = extractDataForRowsFormat(item[key]))
          return out
        item

      extractPathForRowsFormat = (path) ->
        path.segments.map((segment) -> [
          extractDataForRowsFormat(segment.start),
          extractDataForRowsFormat(segment.relationship),
          extractDataForRowsFormat(segment.end)
        ])

      extractPathsForGraphFormat = (paths) ->
        paths = [paths] unless Array.isArray paths
        paths.reduce((all, path) ->
          path.segments.forEach((segment) ->
            all.push(segment.start)
            all.push(segment.end)
            all.push(segment.relationship)
          )
          return all
        , [])

      extractDataForGraphFormat = (item) ->
        return item if item instanceof bolt.types.Node
        return item if item instanceof bolt.types.Relationship
        return extractPathsForGraphFormat item if item instanceof bolt.types.Path
        return no if item is null
        return item.map((subitem) -> extractDataForGraphFormat subitem).filter((i) -> i) if Array.isArray item
        if typeof item is 'object'
          out = Object.keys(item).map((key) -> extractDataForGraphFormat(item[key])).filter((i) -> i)
          return no if not out.length
          return out
        no

      itemIntToString = (item) ->
        return arrayIntToString item if Array.isArray(item)
        return item if typeof item in ['number', 'string']
        return item if item is null
        return item.toString() if bolt.isInt item
        return objIntToString item if typeof item is 'object'

      arrayIntToString = (arr) ->
       arr.map((item) -> itemIntToString item)

      objIntToString = (obj) ->
        Object.keys(obj).forEach((key) ->
          obj[key] = itemIntToString obj[key]
        )
        obj

      boltPlanToRESTPlan = (plan) ->
        obj = boltPlanToRESTPlanShared plan
        obj['runtime-impl'] = plan.arguments['runtime-impl']
        obj['planner-impl'] = plan.arguments['planner-impl']
        obj['version'] = plan.arguments['version']
        obj['KeyNames'] = plan.arguments['KeyNames']
        obj['planner'] = plan.arguments['planner']
        obj['runtime'] = plan.arguments['runtime']
        {root: obj}

      boltPlanToRESTPlanShared = (plan) ->
        return {
          operatorType: plan.operatorType,
          LegacyExpression: plan.arguments.LegacyExpression,
          ExpandExpression: plan.arguments.ExpandExpression,
          DbHits: plan.dbHits,
          Rows: plan.rows,
          EstimatedRows: plan.arguments.EstimatedRows,
          identifiers: plan.identifiers,
          children: plan.children.map boltPlanToRESTPlanShared
        }

      boltStatsToRESTStats = (summary) ->
        return {} unless summary and summary.updateStatistics
        stats = summary.updateStatistics._stats
        newStats = {}
        Object.keys(stats).forEach((key) ->
          newKey = key.replace(/([A-Z]+)/, (m) -> '_' + m.toLowerCase())
          newStats[newKey] = stats[key]
        )
        newStats['contains_updates'] = summary.updateStatistics.containsUpdates()
        newStats

      getSocketErrorObj = ->
        buildErrorObj 'Socket.Error', 'Socket error. Is the server online and have websockets open?'

      buildErrorObj = (code, message) ->
        return {
          fields: [{
            code: code,
            message: message
          }]  
        }

      connect()
      $rootScope.$on 'LocalStorageModule.notification.setitem', (evt, item) =>
        connect() if item.key is 'authorization_data'
      $rootScope.$on 'LocalStorageModule.notification.removeitem', (evt, item) =>
        connect() if item.key is 'authorization_data'

      return {
        connect: connect,
        beginTransaction: beginTransaction,
        transaction: transaction,
        constructResult: (res) ->
          boltResultToRESTResult res
        constructMetaResult: (labels, realtionshipTypes, propertyKeys) ->
          metaResultToRESTResult labels, realtionshipTypes, propertyKeys
      }
  ]
