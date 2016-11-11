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
    'BoltIntHelpers'
    'Features'
    (Settings, AuthDataService, localStorageService, $rootScope, $location, $q, Utils, BoltIntHelpers, Features) ->
      bolt = window.neo4j.v1
      _driversObj = null
      _errorStatus = null

      checkConnectionError = (error) ->
        message = error.message || (error.fields && error.fields[0].message)
        if message.indexOf('WebSocket connection failure') == 0 || message.indexOf('No operations allowed until you send an INIT message successfully') == 0
          $rootScope.check()

      _getRoutedDriver = (host, auth, opts, driversObj) ->
        return _getDirectDriver host, auth, opts, driversObj unless Settings.useBoltRouting
        return _getDirectDriver host, auth, opts, driversObj unless Features.usingCoreEdge
        return driversObj.routed if driversObj.routed
        uri = "bolt+routing://" + host.split("bolt://").join('')
        driversObj.routed = bolt.driver uri, auth, opts

      _getDirectDriver = (host, auth, opts, driversObj) ->
        return driversObj.direct if driversObj.direct
        uri = "bolt://" + host.split("bolt://").join('')
        driversObj.direct = bolt.driver uri, auth, opts

      _shouldEncryptConnection = ->
        encrypted = if $location.protocol() is 'https' then yes else no

      _getAuthData = ->
        authData = AuthDataService.getPlainAuthData()
        if authData then authData.match(/^([^:]+):(.*)$/) else ['','','']

      runQueryOnCluster = (cluster, query, params = {}) ->
        q = $q.defer()
        qs = []
        [_m, username, password] = _getAuthData()
        cluster.forEach((member) ->
          d = bolt.driver(
              "bolt://" + member.address.split("bolt://").join('')
              bolt.auth.basic(username, password),
              {encrypted: _shouldEncryptConnection()}
          )
          s = d.session()
          qs.push(s.run(query, params).then((r) ->
            d.close()
            return r
          ))
        )
        $q.all(qs.map((p) ->
          return p
            .then((r) -> {state: 'fulfilled', value: r})
            .catch((e) -> {state: 'rejected', value: e})
        )).then((r) ->
          q.resolve(r)
        ).catch((e) -> q.reject(e))
        q.promise

      getBoltHost = ->
        Settings.boltHost || $rootScope.boltHost

      getDriverObj = (withoutCredentials = no) ->
        driversObj = {}
        drivers = {}
        host = getBoltHost()
        [_m, username, password] = _getAuthData()
        if withoutCredentials
          auth = bolt.auth.basic('', '')
        else
          auth = bolt.auth.basic(username, password)
        drivers.getDirectDriver =  -> _getDirectDriver host, auth, {encrypted: _shouldEncryptConnection()}, driversObj
        drivers.getRoutedDriver =  -> _getRoutedDriver host, auth, {encrypted: _shouldEncryptConnection()}, driversObj
        drivers.close = () ->
          driversObj.direct.close()
          driversObj.routed.close() if driversObj.routed
        drivers


      testConnection = (withoutCredentials = no, driver = null) ->
        q = $q.defer()
        driver = driver || getDriverObj(withoutCredentials).getDirectDriver()
        driver.onError = (e) ->
          driver.close()
          if e instanceof Event and e.type is 'error'
            q.reject getSocketErrorObj()
          else if e.code and e.message # until Neo4jError is in drivers public API
            q.reject buildErrorObj(e.code, e.message)
          else if e.fields && e.fields[0]
            q.reject e
        driver.onCompleted = (m) ->
          driver.close()
          q.resolve m
        driver.session()
        q.promise

      connect = (withoutCredentials = no) ->
        clearConnection()
        q = $q.defer()
        testConnection(withoutCredentials).then((r) ->
          _driversObj = getDriverObj withoutCredentials
          q.resolve r
        ,(e) -> q.reject e
        )
        q.promise

      clearConnection = ->
        _driversObj.close() if _driversObj?
        _driversObj = null

      beginTransaction = (opts) ->
        q = $q.defer()
        statement = opts[0]?.statement || ''
        parameters = opts[0]?.parameters || {}
        session = _driversObj.getRoutedDriver.session(bolt.session.WRITE)
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
        if not session
          $rootScope.check()
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
                  checkConnectionError(txe)
                  q.reject txe
                )
              else
                session.close()
                q.resolve r
            ).catch((e) ->
              checkConnectionError(txe)
              q.reject e
            )
          else
            p = session.run statement, parameters
            p.then((r) ->
              session.close()
              q.resolve r
            ).catch((e) ->
              checkConnectionError(e)
              q.reject e
            )
        {tx: tx, promise: q.promise, session: session}

      routedWriteTransaction = (query, parameters = {}) ->
        statements = if query then [{statement: query, parameters: parameters}] else []
        session = _driversObj.getRoutedDriver().session(bolt.session.WRITE)
        transaction(statements, session)

      routedReadTransaction = (query, parameters = {}) ->
        statements = if query then [{statement: query, parameters: parameters}] else []
        session = _driversObj.getRoutedDriver().session(bolt.session.READ)
        transaction(statements, session)

      directTransaction = (query, parameters = {}) ->
        statements = if query then [{statement: query, parameters: parameters}] else []
        session = _driversObj.getDirectDriver.session()
        transaction(statements, session)

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

      constructUserResult = (r) ->
        return null unless r.records
        record = r.records[0]
        getRoles = if 'roles' in record.keys then record.get('roles') else ['admin']
        return {username: record.get('username'), roles: getRoles }

      constructCoreEdgeOverview = (r) ->
        return null unless r.records
        entries = r.records.map((entry)-> {id: entry.get('id'), addresses: entry.get('addresses'), role: entry.get('role')})
        return entries

      getClusterRole = (r) ->
        return null unless r.records && r.records.length > 0
        return r.records[0].get('role')

      constructUserListResult = (r) ->
        records = r.records
        return null unless records
        hasRoles = if 'roles' in records[0].keys then yes else no
        records.map((user) ->
          roles = if hasRoles then user.get('roles') else 'N/A'
          {username: user.get('username'), roles: roles , flags: user.get('flags') }
        )
      constructRolesListResult = (r) ->
        return null unless r.records
        r.records.map((user) ->
          user.get('role')
        )

      jmxResultToRESTResult = (r) ->
        return {data: []} unless r.records
        mapped = r.records.map((record) ->
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
        {data: BoltIntHelpers.mapBoltIntsToStrings mapped}

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
#        res = itemIntToString res
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
          item.id = item.identity.toString() if item.identity
          item
        )
        nodes = graphItems.filter((item) -> item instanceof bolt.types.Node)
        rels = graphItems.filter((item) -> item instanceof bolt.types.Relationship)
          .map((item) ->
            item.startNode = item.start.toString()
            item.endNode = item.end.toString()
            item
          )
        {nodes: nodes, relationships: rels}

      extractDataForRowsFormat = (item) ->
        return item.properties if item instanceof bolt.types.Node
        return item.properties if item instanceof bolt.types.Relationship
        return [].concat.apply([], extractPathForRowsFormat(item)) if item instanceof bolt.types.Path
        return item if item is null
        return item if bolt.isInt item
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
        return item if bolt.isInt item
        return item.map((subitem) -> extractDataForGraphFormat subitem).filter((i) -> i) if Array.isArray item
        if typeof item is 'object'
          out = Object.keys(item).map((key) -> extractDataForGraphFormat(item[key])).filter((i) -> i)
          return no if not out.length
          return out
        no

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
          Signature: plan.arguments.Signature,
          DbHits: plan.dbHits,
          Rows: plan.rows,
          EstimatedRows: plan.arguments.EstimatedRows,
          identifiers: plan.identifiers,
          Index: plan.arguments.Index,
          children: plan.children.map boltPlanToRESTPlanShared
        }

      boltStatsToRESTStats = (summary) ->
        return {} unless summary and summary.counters
        counters = summary.counters
        stats = counters._stats
        newStats = {}
        Object.keys(stats).forEach((key) ->
          newKey = key.replace(/([A-Z]+)/, (m) -> '_' + m.toLowerCase())
          newStats[newKey] = stats[key]
        )
        newStats['contains_updates'] = counters.containsUpdates()
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

      recursivelyBoltIntToJsNumber = (any) ->
        test = (n) -> bolt.isInt n
        operation = (n) -> n.toNumber()
        Utils.transformWhatInVal any, test, [operation]

      $rootScope.$on 'connection:authdata_updated', () ->
        connect()

      return {
        getBoltHost: getBoltHost,
        bolt: bolt,
        runQueryOnCluster: runQueryOnCluster,
        testConnection: testConnection,
        connect: connect,
        beginTransaction: beginTransaction,
        transaction: transaction,
        boltTransaction: routedWriteTransaction,
        routedWriteTransaction: routedWriteTransaction,
        routedReadTransaction: routedReadTransaction,
        directTransaction: directTransaction,
        callProcedure: callProcedure,
        constructUserResult: constructUserResult,
        constructCoreEdgeOverview: constructCoreEdgeOverview,
        getClusterRole: getClusterRole,
        constructUserListResult: constructUserListResult,
        constructRolesListResult: constructRolesListResult,
        constructResult: (res) ->
          boltResultToRESTResult res
        constructMetaResult: (labels, relationshipTypes, propertyKeys) ->
          metaResultToRESTResult labels, relationshipTypes, propertyKeys
        constructSchemaResult: (indexes, constraints) ->
          schemaResultToRESTResult indexes, constraints
        constructJmxResult: jmxResultToRESTResult
        constructVersionResult: versionResultToRESTResult
        clearConnection: clearConnection
        recursivelyBoltIntToJsNumber: recursivelyBoltIntToJsNumber
      }
  ]
