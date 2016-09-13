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
  .factory 'motdService', [
    '$rootScope',
    'rssFeedService',
    'motdFeedParser',
    'Settings'
    ($rootScope, rssFeedService, motdFeedParser, Settings) ->
      class Motd
        trackingData = '?utm_source=browser&utm_medium=motd&utm_content=blog&utm_campaign=browser'
        choices =
          quotes: [
            { 'text':'When you label me, you negate me.', 'author':'Soren Kierkegaard' }
            { 'text':'In the beginning was the command line.', 'author':'Neal Stephenson' }
            { 'text':'Remember, all I\'m offering is the truth – nothing more.', 'author':'Morpheus'}
            { 'text':'Testing can show the presence of bugs, but never their absence.', 'author':'Edsger W. Dijkstra'}
            { 'text':'We think your graph is a special snowflake.', 'author':'Neo4j'}
            { 'text':'Still he\'d see the matrix in his sleep, bright lattices of logic unfolding across that colorless void.', 'author':'William Gibson'}
            { 'text':'Eventually everything connects.', 'author':'Charles Eames'}
            { 'text':'To develop a complete mind: study the science of art. Study the art of science. Develop your senses - especially learn how to see. Realize that everything connects to everything else.', 'author':'Leonardo da Vinci'}
          ],
          tips: [
            'Use <shift-return> for multi-line, <cmd-return> to evaluate command'
            'Navigate history with <ctrl- up/down arrow>'
            'When in doubt, ask for :help'
          ],
          unrecognizable: [
            "Interesting. How does this make you feel?"
            "Even if I squint, I can't make out what that is. Is it an elephant?"
            "This one time, at bandcamp..."
            "Ineffable, enigmatic, possibly transcendent. Also quite good looking."
            "I'm not (yet) smart enough to understand this."
            "Oh I agree. Kaaviot ovat suuria!"
          ],
          emptiness: [
            "No nodes. Know nodes?"
            "Waiting for the big bang of data."
            "Ready for anything."
            "Every graph starts with the first node."
          ],
          disconnected: [
            "Disconnected from Neo4j. Please check if the cord is unplugged."
          ],
          callToAction: [
            {
              'd': "Every good graph starts with Neo4j."
              'u':'http://neo4j.com/' + trackingData
            },
            {
              'd': 'Join our Neo4j Slack community.',
              'u': 'http://neo4j.com/slack/' + trackingData
            },
            {
              'd': 'Start coding your application with a driver for your language of choice.',
              'u': 'http://neo4j.com/developer/language-guides/' + trackingData
            },
            {
              'd': "Visualize even more of your graph, using one of these great tools."
              'u':'http://neo4j.com/developer/guide-data-visualization/' + trackingData
            },
            {
              'd': "Keep this handy Cypher Reference Card with you at all times ;)"
              'u':'http://neo4j.com/docs/stable/cypher-refcard/' + trackingData
            },
            {
              'd': "Free online training, to level-up your Neo4j skills."
              'u':'http://neo4j.com/graphacademy/online-training/' + trackingData
            },
            {
              'd': "Join the thousands who have graduated from Graph Academy."
              'u':'http://neo4j.com/graphacademy/' + trackingData
            },
            {
              'd': "Got data? Learn how to import it into Neo4j."
              'u':'http://neo4j.com/developer/guide-import-csv/' + trackingData
            },
            {
              'd': "Ready to launch? Check the Neo4j Performance Tuning Guide to maximize your success"
              'u':'http://neo4j.com/developer/guide-performance-tuning/' + trackingData
            },
            {
              'd': "Fraud! Everything you need to know about detecting it with Neo4j."
              'u': "http://neo4j.com/use-cases/fraud-detection/"
            },
            {
              'd': "People like you have read this. Now they can make recommendations like an Amazonian."
              'u': "http://neo4j.com/use-cases/real-time-recommendation-engine/"
            },
            {
              'd': "Everything is social. Manage people relationships in your graph."
              'u': "http://neo4j.com/use-cases/social-network/"
            }
          ]

        quote: ""
        tip: ""
        unrecognized: ""
        emptiness: ""

        constructor: ->

        setCallToActionVersion: (version) ->
          return if @cta_version is version
          @cta_version = version
          @refresh()

        getCallToActionFeedItem: (feed) ->
          that = @
          match_filter =
            version: (val) ->
              return yes unless val
              re = new RegExp('^' + val)
              res = re.test(that.cta_version)
            combo: (val) ->
              return no unless val
              res = /^!/.test val
          item = motdFeedParser.getFirstMatch(feed, match_filter)

          if not item?.d
            match_filter =
              version: (val) ->
                return yes unless val
                re = new RegExp('^' + val)
                hit = re.test(that.cta_version)
                return hit or val is 'neo4j'
            item = motdFeedParser.getFirstMatch(feed, match_filter)
          item.bang = motdFeedParser.explodeTags(item.t).combo?.replace(/[^a-z]*/ig, '')
          if (item?.u and item.u.indexOf('blog') >= 0)
            item.d = "Latest Blog: " + item.d
          item

        refresh: ->
          @quote = @pickRandomlyFrom(choices.quotes)
          @tip = @pickRandomlyFrom(choices.tips)
          @unrecognized = @pickRandomlyFrom(choices.unrecognizable)
          @emptiness = @pickRandomlyFrom(choices.emptiness)
          @disconnected = @pickRandomlyFrom(choices.disconnected)
          @callToAction = @pickRandomlyFrom(choices.callToAction)
          return if Settings.enableMotd is no
          return if not $rootScope.neo4j.config.allow_outgoing_browser_connections

        pickRandomlyFrom: (fromThis) ->
          return fromThis[Math.floor(Math.random() * fromThis.length)]

        pickRandomlyFromChoiceName: (choiceName) ->
          return '' unless choices[choiceName]
          @pickRandomlyFrom(choices[choiceName])
      new Motd
]
