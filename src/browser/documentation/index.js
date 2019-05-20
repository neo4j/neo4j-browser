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

// Carousels
import guideConcepts from './guides/concepts'
import guideCypher from './guides/cypher'
import guideIntro from './guides/intro'
import guideLearn from './guides/learn'
import guideMovieGraph from './guides/movie-graph'
import guideNorthwindGraph from './guides/northwind-graph'

// Pages
import guideExplore from './guides/explore'
import guideIconography from './guides/iconography'
import guideStart from './guides/start'
import guideTypography from './guides/typography'
import guideUnfound from './guides/unfound'
import guideWelcome from './guides/welcome'
import guideWritecode from './guides/write-code'

// Help
import helpBolt from './help/bolt'
import helpBoltEncryption from './help/bolt-encryption'
import helpBoltRouting from './help/bolt-routing'
import helpClear from './help/clear'
import helpCommands from './help/commands'
import helpContains from './help/contains'
import helpCreateConstraintOn from './help/create-constraint-on'
import helpCreateIndexOn from './help/create-index-on'
import helpCreate from './help/create'
import helpCypher from './help/cypher'
import helpDelete from './help/delete'
import helpDropConstraintOn from './help/drop-constraint-on'
import helpDropIndexOn from './help/drop-index-on'
import helpDetachDelete from './help/detach-delete'
import helpEndsWith from './help/ends-with'
import helpExplain from './help/explain'
import helpForeach from './help/foreach'
import helpHelp from './help/help'
import helpHistory from './help/history'
import helpHistoryClear from './help/history-clear'
import helpKeys from './help/keys'
import helpLoadCsv from './help/load-csv'
import helpMatch from './help/match'
import helpMerge from './help/merge'
import helpParam from './help/param'
import helpParams from './help/params'
import helpPlay from './help/play'
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

export default {
  guides: {
    concepts: guideConcepts,
    cypher: guideCypher,
    intro: guideIntro,
    learn: guideLearn,
    moviegraph: guideMovieGraph,
    movies: guideMovieGraph,
    northwindgraph: guideNorthwindGraph,
    explore: guideExplore,
    iconography: guideIconography,
    start: guideStart,
    typography: guideTypography,
    unfound: guideUnfound,
    welcome: guideWelcome,
    writecode: guideWritecode
  },
  help: {
    bolt: helpBolt,
    boltEncryption: helpBoltEncryption,
    boltRouting: helpBoltRouting,
    clear: helpClear,
    commands: helpCommands,
    contains: helpContains,
    createConstraintOn: helpCreateConstraintOn,
    createIndexOn: helpCreateIndexOn,
    create: helpCreate,
    cypher: helpCypher,
    delete: helpDelete,
    detachDelete: helpDetachDelete,
    dropConstraintOn: helpDropConstraintOn,
    dropIndexOn: helpDropIndexOn,
    endsWith: helpEndsWith,
    explain: helpExplain,
    foreach: helpForeach,
    help: helpHelp,
    history: helpHistory,
    historyClear: helpHistoryClear,
    keys: helpKeys,
    loadCsv: helpLoadCsv,
    match: helpMatch,
    merge: helpMerge,
    param: helpParam,
    params: helpParams,
    play: helpPlay,
    profile: helpProfile,
    queries: helpQueries,
    queryPlan: helpQueryPlan,
    remove: helpRemove,
    rest: helpRest,
    restDelete: helpRestDelete,
    restGet: helpRestGet,
    restPost: helpRestPost,
    restPut: helpRestPut,
    return: helpReturn,
    server: helpServer,
    serverUser: helpServerUser,
    set: helpSet,
    start: helpStart,
    startsWith: helpStartsWith,
    style: helpStyle,
    template: helpTemplate,
    unfound: helpUnfound,
    unknown: helpUnknown,
    unwind: helpUnwind,
    where: helpWhere,
    with: helpWith
  }
}