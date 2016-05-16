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
    '$location'
    '$q'
    'Utils'
    (Settings, AuthDataService, localStorageService, $rootScope, $location, $q, Utils) ->
      bolt = window.neo4j.v1
      _driver = null
      _errorStatus = null

      getDriverObj = (withoutCredentials = no) ->
        authData = AuthDataService.getPlainAuthData()
        host = Settings.boltHost || $location.host()
        encrypted = if $location.protocol() is 'https' then yes else no
        [_m, username, password] = if authData then authData.match(/^([^:]+):(.*)$/) else ['','','']
        if withoutCredentials
          driver = bolt.driver("bolt://" + host, bolt.auth.basic('', ''), {encrypted: encrypted})
        else
          driver = bolt.driver("bolt://" + host, bolt.auth.basic(username, password), {encrypted: encrypted})
        driver

      testQuery = (driver) ->
        q = $q.defer()
        driver.onError = (e) -> 
          if e instanceof Event and e.type is 'error'
            q.reject getSocketErrorObj()
          else if e.code and e.message # until Neo4jError is in drivers public API
            q.reject buildErrorObj(e.code, e.message)
        session = driver.session()
        p = session.run("CALL db.labels")
        p.then((r) ->
          session.close()
          q.resolve r
        ).catch((e)->
          session.close()
          q.reject e
        )
        q.promise

      testConnection = (withoutCredentials = no) ->
        q = $q.defer()
        driver = getDriverObj withoutCredentials
        testQuery(driver).then((r) -> 
          q.resolve r
          _errorStatus = null
          driver.close()
        ).catch((e) -> 
          q.reject e
          _errorStatus = e
          driver.close()
        )
        q.promise

      connect = (withoutCredentials = no) ->
        q = $q.defer()
        _driver = getDriverObj withoutCredentials
        testQuery(_driver)
          .then((r) -> q.resolve r)
          .catch((e) -> 
            _driver = null unless e.fields[0].code is 'Neo.ClientError.Security.CredentialsExpired'
            q.reject e
          )
        q.promise

      clearConnection = ->
        _driver.close() if _driver?
        _driver = null

      createSession = () ->
        return _driver.session() if _driver
        return no

      beginTransaction = (opts) ->
        q = $q.defer()
        statement = opts[0]?.statement || ''
        parameters = opts[0]?.parameters || {}
        session = createSession()
        if not session
          tx = null
          q.reject getSocketErrorObj()
        else
          tx = session.beginTransaction()
          q.resolve() unless statement
          tx.run(statement, parameters).then((r)-> q.resolve(r)).catch((e)-> q.reject(e)) if statement
        return {tx: tx, session: session, promise: q.promise}

      transaction = (opts, session, tx) ->
        statement = opts[0]?.statement || ''
        parameters = opts[0]?.parameters || {}
        q = $q.defer()
        session = session || createSession()
        if not session
          q.reject getSocketErrorObj()
        else
          if tx
            # We need to look for error messages from
            # the commit() call even though run() 
            # reported a successful operation
            p = tx.run statement, parameters
            p.then((r) -> 
              if tx # The tx might have been terminated
                tx.commit().then((txr) -> 
                  session.close()
                  q.resolve r
                ).catch((txe) ->
                  session.close()
                  q.reject txe
                )
              else
                session.close()
                q.resolve r
            ).catch((e) ->
              session.close()
              q.reject e
            )
          else
            p = session.run statement, parameters
            p.then((r) ->
              session.close()
              q.resolve r
            ).catch((e) ->
              session.close()
              q.reject e
            )
        {tx: tx, promise: q.promise, session: session}

      boltTransaction = (query, parameters = {}) ->
        statements = if query then [{statement: query, parameters: parameters}] else []
        transaction(statements)

      callProcedure = (query, parameters = {}) ->
        statements = if query then [{statement: "CALL " + query, parameters: parameters}] else []
        result = transaction(statements)
        q = $q.defer()
        result.promise
          .then((res) -> q.resolve(res.records))
          .catch((err) -> q.resolve([]))
        q.promise

      metaResultToRESTResult = (labels, relationshipTypes, propertyKeys) ->
        labels: labels.get(1)
        relationships: relationshipTypes.get(1)
        propertyKeys: propertyKeys.get(1)

      versionResultToRESTResult = (r) ->
        return null unless r.records
        {version: r.records[0].get('versions')[0], edition: r.records[0].get('edition')}

      jmxResultToRESTResult = (r, whatToGet = []) ->
        return {data: []} unless r.records
        r.records = itemIntToString r.records
        filtered = r.records.filter((record) -> whatToGet.indexOf(record.get('name')) > -1)
          .map((record) -> 
            origAttributes = record.get('attributes')
            return {
              name: record.get('name'), 
              description: record.get('description'), 
              attributes: Object.keys(record.get('attributes')).map((attributeName) -> {
                name: attributeName,
                description: origAttributes[attributeName].description,
                value: origAttributes[attributeName].value
              })
            }
          )
        {data: filtered}

      schemaResultToRESTResult = (indexes, constraints) ->
        indexString = ""
        constraintsString = ""
        if (indexes.length == 0)
          indexString =  "No indexes"
        else
          indexString = "Indexes"
          for index in indexes
            indexString += "\n  #{index.description.replace('INDEX','')} #{index.state.toUpperCase()}"
            if index.type == "node_unique_property"
              indexString += " (for uniqueness constraint)"
        if (constraints.length == 0)
          constraintsString = "No constraints"
        else
          constraintsString = "Constraints"
          for constraint in constraints
            constraintsString += "\n  #{constraint.description.replace('CONSTRAINT','')}"
        return "#{indexString}\n\n#{constraintsString}\n"

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
        if result.code and result.message  # until Neo4jError is in drivers public API
          return boltResultToRESTResult(buildErrorObj(result.code, result.message))
        keys = if res.length then res[0].keys else []
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
          res = extractDataForRowsFormat(record.get(curr))
          res = [res] if Array.isArray res
          tot.concat res
        , [])

      getRESTMetaFromBolt = (record, keys) ->
        items = keys.map((key) -> record.get(key))
        items.map((item) ->
          type = 'node' if item instanceof bolt.types.Node
          type = 'relationship' if item instanceof bolt.types.Relationship
          return {id: item.identity, type: type} if type
          null
        )

      getRESTGraphFromBolt = (record, keys) ->
        items = keys.map((key) -> record.get(key))
        graphItems = Utils.flattenArray [extractDataForGraphFormat items]
        graphItems.map((item) ->
          item.id = item.identity
          item
        )
        nodes = graphItems.filter((item) -> item instanceof bolt.types.Node)
        rels = graphItems.filter((item) -> item instanceof bolt.types.Relationship)
          .map((item) ->
            item.startNode = item.start
            item.endNode = item.end
            item
          )
        {nodes: nodes, relationships: rels}

      extractDataForRowsFormat = (item) ->
        return item.properties if item instanceof bolt.types.Node
        return item.properties if item instanceof bolt.types.Relationship
        return [].concat.apply([], extractPathForRowsFormat(item)) if item instanceof bolt.types.Path
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
        return [].concat.apply([], extractPathsForGraphFormat(item)) if item instanceof bolt.types.Path
        return no if item is null
        return item.map((subitem) -> extractDataForGraphFormat subitem).filter((i) -> i) if Array.isArray item
        if typeof item is 'object'
          out = Object.keys(item).map((key) -> extractDataForGraphFormat(item[key])).filter((i) -> i)
          return no if not out.length
          return out
        no

      itemIntToString = (item) ->
        return arrayIntToString item if Array.isArray(item)
        return item if typeof item in ['number', 'string', 'boolean']
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
          Index: plan.arguments.Index,
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
        return _errorStatus if _errorStatus
        buildErrorObj 'Socket.Error', 'Socket error. Is the server online and have websockets open?'

      buildErrorObj = (code, message) ->
        return {
          fields: [{
            code: code,
            message: message
          }]
        }

      $rootScope.$on 'connection:authdata_updated', () ->
        connect()

      return {
        testConnection: testConnection,
        connect: connect,
        beginTransaction: beginTransaction,
        transaction: transaction,
        boltTransaction: boltTransaction,
        callProcedure: callProcedure,
        constructResult: (res) ->
          boltResultToRESTResult res
        constructMetaResult: (labels, relationshipTypes, propertyKeys) ->
          metaResultToRESTResult labels, relationshipTypes, propertyKeys
        constructSchemaResult: (indexes, constraints) ->
          schemaResultToRESTResult indexes, constraints
        constructJmxResult: jmxResultToRESTResult
        constructVersionResult: versionResultToRESTResult
        clearConnection: clearConnection
      }
  ]
