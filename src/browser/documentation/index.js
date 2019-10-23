/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

// Help
import helpBolt from './dynamic/bolt'
import helpBoltEncryption from './help/bolt-encryption'
import helpBoltRouting from './help/bolt-routing'
import helpClear from './help/clear'
import helpContains from './help/contains'
import helpCreateConstraintOn from './help/create-constraint-on'
import helpCreateIndexOn from './help/create-index-on'
import helpCreate from './help/create'
import helpDelete from './help/delete'
import helpDropConstraintOn from './help/drop-constraint-on'
import helpDropIndexOn from './help/drop-index-on'
import helpDetachDelete from './help/detach-delete'
import helpEndsWith from './help/ends-with'
import helpExplain from './help/explain'
import helpForeach from './help/foreach'
import helpHistory from './help/history'
import helpHistoryClear from './help/history-clear'
import helpKeys from './help/keys'
import helpLoadCsv from './help/load-csv'
import helpMatch from './help/match'
import helpMerge from './help/merge'
import helpParam from './help/param'
import helpParams from './help/params'
import helpProfile from './help/profile'
import helpQueries from './help/queries'
import helpQueryPlan from './help/query-plan'
import helpRemove from './help/remove'
import helpRest from './help/rest'
import helpRestDelete from './help/rest-delete'
import helpRestGet from './help/rest-get'
import helpRestPost from './help/rest-post'
import helpRestPut from './help/rest-put'
import helpReturn from './help/return'
import helpServer from './help/server'
import helpServerUser from './help/server-user'
import helpSet from './help/set'
import helpStart from './help/start'
import helpStartsWith from './help/starts-with'
import helpStyle from './help/style'
import helpTemplate from './help/template'
import helpUnfound from './help/unfound'
import helpUnknown from './help/unknown'
import helpUnwind from './help/unwind'
import helpWhere from './help/where'
import helpWith from './help/with'

// Dynamic Help
import helpCommands from './dynamic/commands'
import helpCypher from './dynamic/cypher'
import helpHelp from './dynamic/help'
import helpPlay from './dynamic/play'

// Carousels
import guideConcepts from './guides/concepts'
import guideCypher from './guides/cypher'
import guideIntro from './guides/intro'
import guideLearn from './guides/learn'
import guideMovieGraph from './guides/movie-graph'
import guideNorthwindGraph from './guides/northwind-graph'

// Pages
import guideIconography from './guides/iconography'
import guideStart from './guides/start'
import guideTypography from './guides/typography'
import guideUnfound from './guides/unfound'
import guideWritecode from './guides/write-code'

export default {
  help: {
    title: 'Commands',
    chapters: {
      clear: helpClear,
      cypher: helpCypher,
      bolt: helpBolt,
      commands: helpCommands,
      guides: helpPlay,
      help: helpHelp,
      history: helpHistory,
      historyClear: helpHistoryClear,
      keys: helpKeys,
      play: helpPlay,
      server: helpServer,
      serverUser: helpServerUser,
      style: helpStyle,
      unfound: helpUnfound,
      unknown: helpUnknown,
      queries: helpQueries
    }
  },
  cypher: {
    title: 'Cypher',
    chapters: {
      contains: helpContains,
      createConstraintOn: helpCreateConstraintOn,
      createIndexOn: helpCreateIndexOn,
      create: helpCreate,
      delete: helpDelete,
      detachDelete: helpDetachDelete,
      dropConstraintOn: helpDropConstraintOn,
      dropIndexOn: helpDropIndexOn,
      endsWith: helpEndsWith,
      explain: helpExplain,
      foreach: helpForeach,
      loadCsv: helpLoadCsv,
      match: helpMatch,
      merge: helpMerge,
      param: helpParam,
      params: helpParams,
      profile: helpProfile,
      queryPlan: helpQueryPlan,
      remove: helpRemove,
      rest: helpRest,
      restDelete: helpRestDelete,
      restGet: helpRestGet,
      restPost: helpRestPost,
      restPut: helpRestPut,
      return: helpReturn,
      set: helpSet,
      start: helpStart,
      startsWith: helpStartsWith,
      template: helpTemplate,
      unwind: helpUnwind,
      where: helpWhere,
      with: helpWith
    }
  },
  bolt: {
    title: 'Bolt',
    chapters: {
      boltEncryption: helpBoltEncryption,
      boltRouting: helpBoltRouting
    }
  },
  play: {
    title: 'Guides & Examples',
    chapters: {
      concepts: guideConcepts,
      cypher: guideCypher,
      intro: guideIntro,
      learn: guideLearn,
      movieGraph: guideMovieGraph,
      movies: guideMovieGraph,
      northwindGraph: guideNorthwindGraph,
      northwind: guideNorthwindGraph,
      iconography: guideIconography,
      start: guideStart,
      typography: guideTypography,
      unfound: guideUnfound,
      writeCode: guideWritecode,
      // Commands only
      'query-template': {
        title: 'Query Templates',
        category: 'guides'
      }
    }
  }
}
