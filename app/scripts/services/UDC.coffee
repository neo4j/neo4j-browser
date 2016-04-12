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
  .service 'UsageDataCollectionService', [
    'Settings'
    'localStorageService'
    'Intercom'
    '$timeout'
    (Settings, localStorageService, Intercom, $timeout) ->
      storageKey = 'udc'

      class UsageDataCollectionService
        constructor: ->
          @data = localStorageService.get(storageKey)
          @data = @reset() unless angular.isObject(@data)
          @data.client_starts = (@data.client_starts || 0) + 1
          @save()
          @connectedUser = no
          @user_id = no

        reset: ->
          @data = {
            uuid: UUID.genV1().toString()
            created_at: Math.round(Date.now() / 1000)
            client_starts: 0
            events: []
          }
          @save()
          return @data

        loadUDC: ->
          Intercom.load()
          Intercom.reload()
          @connectUser()

        unloadUDC: ->
          Intercom.unload()

        reloadUDC: ->
          Intercom.unload()
          Intercom.load()
          Intercom.reload()

        set: (key, value) ->
          @data[key] = value
          @save()
          return value

        increment: (key) ->
          @data[key] = (@data[key] || 0) + 1
          @save()
          return @data[key]

        updateStoreAndServerVersion: (neo4jVersion, storeId) ->
          @set('store_id',  storeId)
          @set('neo4j_version',neo4jVersion)
          if @connectedUser
            Intercom.update(@userData())

        connectUserWithUserId: (userId) ->
          @user_id =  userId
          @connectUser()

        disconnectUser: () ->
          @connectedUser = no
          @user_id = no
          Intercom.disconnect()
          @reloadUDC()

        trackEvent: (name, data) ->
          if @connectedUser  && (@isBeta() || Settings.shouldReportUdc)
            Intercom.event(name, data)
          else
            @data.events = @data.events || []
            @data.events.push({
              name: name
              data: data
            })
            @save()

        trackConnectEvent: () ->
          if @shouldTriggerConnectEvent()
            @trackEvent('connect', {
              store_id: @data.store_id
              neo4j_version: @data.neo4j_version
              client_starts: @data.client_starts
              cypher_attempts: @data.cypher_attempts
              cypher_wins: @data.cypher_wins
              cypher_fails: @data.cypher_fails
              accepts_replies: Settings.acceptsReplies
            })

        toggleMessenger: ->
          Intercom.toggle()

        showMessenger: ->
          Intercom.showMessenger()

        newMessage: (message) ->
          Intercom.newMessage message

        connectUser: () ->
          if not @connectedUser && @shouldConnect()
            if @isBeta() || Settings.shouldReportUdc
              Intercom.user(@user_id, @userData())
              Intercom.event(event.name, event.data) for event in @data.events
              @data.events = []
            else
              Intercom.user(@user_id, {})
            @connectedUser=true
          return @connectedUser

        userData: ->
          userData = $.extend({}, @data)
          delete(userData.events)
          userData.name = Settings.userName
          if ( @data.neo4j_version && @data.store_id )
            userData.companies = [
              {
                type: "company"
                name: "Neo4j " + @data.neo4j_version + " " + @data.store_id
                company_id: @data.store_id
              }
            ]
          userData

        shouldConnect: () =>
         return  @user_id && Intercom.isLoaded()

        shouldTriggerConnectEvent: ->
          pingTime = new Date(@data.pingTime || 0)
          today = new Date()
          today = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          if (pingTime < today)
            @set("pingTime", today.getTime())
            return true
          else
            return false

        isBeta: ->
          return /-M\d\d/.test(@data.neo4j_version)

        save: ->
          localStorageService.set(storageKey, JSON.stringify(@data))

      new UsageDataCollectionService()
  ]
