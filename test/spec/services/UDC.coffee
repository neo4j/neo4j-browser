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

'use strict'

describe 'Service: UDC', () ->
  UsageDataCollectionService = {}
  Settings = {}
  httpBackend = {}
  Cypher = {}
  Bolt = {}
  Intercom={}
  scope = {}
  q = {}

  # load the service's module
  beforeEach module 'neo4jApp.services'

  beforeEach ->
    inject((_UsageDataCollectionService_, _Settings_, $httpBackend, _Cypher_, _Bolt_, $rootScope, $q, _Intercom_) ->
      UsageDataCollectionService = _UsageDataCollectionService_
      Settings = _Settings_
      httpBackend = $httpBackend
      Cypher = _Cypher_
      Bolt = _Bolt_
      scope = $rootScope.$new()
      q = $q
      Intercom = _Intercom_
    )

  describe "connection to intercom", ->
    beforeEach ->
      UsageDataCollectionService.reset()
      loaded = no
      spyOn(Intercom, "isLoaded").and.callFake( ->
        return loaded
      )
      spyOn(Intercom, "load").and.callFake( ->
        loaded = true
      )
      spyOn(Intercom, "user")

    it 'should connect user with id if UDC is already loaded  ', ->
      UsageDataCollectionService.reset()
      UsageDataCollectionService.loadUDC()
      expect(Intercom.user).not.toHaveBeenCalled()
      UsageDataCollectionService.connectUserWithUserIdAndName("userid")
      expect(Intercom.user).toHaveBeenCalledWith("userid", jasmine.any(Object))
      expect(UsageDataCollectionService.connectedUser).toBeTruthy()

    it 'should connect user with id once UDC has been loaded', ->
      UsageDataCollectionService.reset()
      UsageDataCollectionService.connectUserWithUserIdAndName("userid")
      expect(Intercom.user).not.toHaveBeenCalled()
      UsageDataCollectionService.loadUDC()
      expect(Intercom.user).toHaveBeenCalledWith("userid", jasmine.any(Object))
      expect(UsageDataCollectionService.connectedUser).toBeTruthy()

    it 'should send user data on connect when "shouldReportUdc" in Settings is set to true', ->
      Settings.shouldReportUdc = yes
      UsageDataCollectionService.connectUserWithUserIdAndName("userid", 'Person A')
      UsageDataCollectionService.loadUDC()
      expect(Intercom.user).toHaveBeenCalledWith('userid', jasmine.objectContaining({name: 'Person A'}))

    it 'should send user data on connect when "shouldReportUdc" in Settings is set to true', ->
      Settings.shouldReportUdc = no
      UsageDataCollectionService.connectUserWithUserIdAndName("userid")
      UsageDataCollectionService.loadUDC()
      expect(Intercom.user).toHaveBeenCalledWith('userid', {})

    describe 'events', ->
      it 'should send event if user is connected and "shouldReportUdc" in Settings is set to true', ->
        Settings.shouldReportUdc = yes
        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        UsageDataCollectionService.loadUDC()
        spyOn(Intercom, "event")
        UsageDataCollectionService.trackEvent("event", {"some_key":"some_value"})
        expect(Intercom.event).toHaveBeenCalledWith("event", {"some_key":"some_value"})

      it 'should not send event if user is connected but "shouldReportUdc" in Settings is set to false', ->
        Settings.shouldReportUdc = no
        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        UsageDataCollectionService.loadUDC()
        spyOn(Intercom, "event")
        UsageDataCollectionService.trackEvent("event", {"some_key":"some_value"})
        expect(Intercom.event).not.toHaveBeenCalled()

      it 'should send events on connect if user is not connected when event is triggered if "shouldReportUdc" in Settings is set to true', ->
        Settings.shouldReportUdc = yes
        UsageDataCollectionService.loadUDC()
        spyOn(Intercom, "event")
        UsageDataCollectionService.trackEvent("event", {"some_key":"some_value"})
        expect(Intercom.event).not.toHaveBeenCalled()

        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        expect(Intercom.event).toHaveBeenCalledWith("event", {"some_key":"some_value"})

        it 'should not send events on later connect if "shouldReportUdc" in Settings is set to false', ->
          Settings.shouldReportUdc = no
          UsageDataCollectionService.loadUDC()
          spyOn(Intercom, "event")
          UsageDataCollectionService.trackEvent("event", {"some_key":"some_value"})
          expect(Intercom.event).not.toHaveBeenCalled()

          UsageDataCollectionService.connectUserWithUserIdAndName("userid")
          expect(Intercom.event).not.toHaveBeenCalled()

        describe "Connect event frequency frequency", ->
          it 'should only trigger connect event once', ->
            Settings.shouldReportUdc = yes
            UsageDataCollectionService.loadUDC()
            UsageDataCollectionService.connectUserWithUserIdAndName("userid")
            spyOn(Intercom, "event")

            UsageDataCollectionService.trackConnectEvent()
            UsageDataCollectionService.trackConnectEvent()
            expect(Intercom.event.calls.count()).toEqual(1)

    describe "Disconnect user", ->
      it 'should clear stored user_id and shutdown and reload Intercom', ->
        spyOn(Intercom, "unload")
        spyOn(Intercom, "reload")
        spyOn(Intercom, "disconnect")

        UsageDataCollectionService.loadUDC()
        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        expect(Intercom.user).toHaveBeenCalled()
        expect(UsageDataCollectionService.connectedUser).toBeTruthy()

        UsageDataCollectionService.disconnectUser()
        expect(Intercom.disconnect).toHaveBeenCalled()
        expect(Intercom.unload).toHaveBeenCalled()
        expect(Intercom.load).toHaveBeenCalled()
        expect(Intercom.reload).toHaveBeenCalled()
        expect(UsageDataCollectionService.connectedUser).toBeFalsy()
        expect(UsageDataCollectionService.data.user_id).toBeFalsy()

    describe "Update store and version", ->
      it 'should send an update to intercom with company info if user is connected', ->
        spyOn(Intercom, "update")
        UsageDataCollectionService.loadUDC()
        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        UsageDataCollectionService.updateStoreAndServerVersion('Neo4j-test-version', 'test-store-id')

        expect(Intercom.update).toHaveBeenCalledWith(jasmine.objectContaining({companies:[{
          type: "company"
          name: "Neo4j Neo4j-test-version test-store-id"
          company_id: 'test-store-id'
        }]}))

      it 'should company info when user is connected', ->
        spyOn(Intercom, "update")
        UsageDataCollectionService.loadUDC()
        UsageDataCollectionService.updateStoreAndServerVersion('Neo4j-test-version', 'test-store-id')
        expect(Intercom.update).not.toHaveBeenCalled()
        UsageDataCollectionService.connectUserWithUserIdAndName("userid")
        expect(Intercom.user).toHaveBeenCalledWith("userid", jasmine.objectContaining({companies:[{
          type: "company"
          name: "Neo4j Neo4j-test-version test-store-id"
          company_id: 'test-store-id'
        }]}))

  describe "Stats", ->
    it 'should treat a begin/commit transaction as one attempt', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      current_transaction = Cypher.transaction(no)
      httpBackend.expectPOST("#{Settings.endpoint.transaction}")
      .respond(->
        return [200, JSON.stringify({
          commit: "http://localhost:9000#{Settings.endpoint.transaction}/1/commit",
          results: []
          errors: []
        })]
      )

      current_transaction.begin().then(
        ->
          type = typeof UsageDataCollectionService.data['cypher_attempts']
          expect(type).toBe('undefined')
      )
      scope.$apply()
      httpBackend.flush()

      httpBackend.expectPOST("#{Settings.endpoint.transaction}/1/commit")
      .respond(->
        return [200, JSON.stringify({
          results: [{
            columns: ["n"],
            data: [{
              row: [{name: 'mock'}],
              graph: {nodes: [{id: 1}], relationships: []}
            }],
            stats: {}
          }],
          errors: []
        })]
      )
      current_transaction.commit("MATCH n RETURN n").then(
        ->
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_wins).toBe(1)
      )
      scope.$apply()
      httpBackend.flush()

    it 'should collect stats from auto-committed transactions', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      UsageDataCollectionService
      current_transaction = Cypher.transaction(no)

      httpBackend.expectPOST("#{Settings.endpoint.transaction}/commit")
      .respond(->
        return [200, JSON.stringify({
          results: [{
            columns: ["n"],
            data: [{
              row: [{name: 'mock'}],
              graph: {nodes: [{id: 1}], relationships: []}
            }],
            stats: {}
          }],
          errors: []
        })]
      )
      current_transaction.commit("MATCH n RETURN n").then(
        ->
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_wins).toBe(1)
      )
      scope.$apply()
      httpBackend.flush()

    it 'should detect a cypher failure', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      current_transaction = Cypher.transaction(no)
      httpBackend.expectPOST("#{Settings.endpoint.transaction}")
      .respond(->
        return [200, JSON.stringify({
          commit: "http://localhost:9000#{Settings.endpoint.transaction}/1/commit",
          results: []
          errors: []
        })]
      )

      current_transaction.begin()
      scope.$apply()
      httpBackend.flush()

      httpBackend.expectPOST("#{Settings.endpoint.transaction}/1/commit")
      .respond(->
        return [200, JSON.stringify({
          results: [],
          errors: [{code: 'TestFail', message:'This is a wanted failure.'}]
        })]
      )
      current_transaction.commit("MATCH n RETURN nr").then(
        ->
          expect("This should never happen").toBe('Nope')
        ->
          wins_type = typeof UsageDataCollectionService.data['cypher_wins']
          expect(wins_type).toBe('undefined')
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_fails).toBe(1)
      )
      scope.$apply()
      httpBackend.flush()

    it 'should detect a failure in an auto-committed transaction', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      current_transaction = Cypher.transaction(no)

      httpBackend.expectPOST("#{Settings.endpoint.transaction}/commit")
      .respond(->
        return [200, JSON.stringify({
          results: [],
          errors: [{code: 'TestFail', message:'This is a wanted failure.'}]
        })]
      )
      current_transaction.commit("MATCH n RETURN n").then(
        ->
          expect("This should never happen").toBe('Nope')
        ->
          wins_type = typeof UsageDataCollectionService.data['cypher_wins']
          expect(wins_type).toBe('undefined')
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_fails).toBe(1)
      )
      scope.$apply()
      httpBackend.flush()

    it 'should detect a successful bolt transaction', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      qq = q.defer()
      qq.resolve({records: [], summary: {counters: {_stats: [], containsUpdates: ->}}})
      spyOn(Bolt, "transaction").and.returnValue({tx: null, promise: qq.promise})
      current_transaction = Cypher.transaction(yes)
      p = current_transaction.commit("MATCH n RETURN n")
      p.then(
        ->
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_wins).toBe(1)
        ->
          expect("This should never happen").toBe('Nope')
      )
      scope.$apply()

    it 'should detect a failure in a bolt transaction', ->
      UsageDataCollectionService.reset()
      Settings.shouldReportUdc = yes
      qq = q.defer()
      qq.reject({fields: [{code: 'TestFail', message:'This is a wanted failure.'}]})
      spyOn(Bolt, "transaction").and.returnValue({tx: null, promise: qq.promise})
      current_transaction = Cypher.transaction(yes)
      p = current_transaction.commit("MATCH n RETURN n")
      p.then(
        ->
          expect("This should never happen").toBe('Nope')
        ->
          wins_type = typeof UsageDataCollectionService.data['cypher_wins']
          expect(wins_type).toBe('undefined')
          expect(UsageDataCollectionService.data.cypher_attempts).toBe(1)
          expect(UsageDataCollectionService.data.cypher_fails).toBe(1)
      )
      scope.$apply()

