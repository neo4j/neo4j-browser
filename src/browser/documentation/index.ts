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
// Help
import helpBolt from './dynamic/bolt'
// Dynamic Help
import helpCommands from './dynamic/commands'
import helpCypher from './dynamic/cypher'
import helpHelp from './dynamic/help'
import helpPlay from './dynamic/play'
import helpAlterUser from './help/alter-user'
import helpAuto from './help/auto'
import helpBoltEncryption from './help/bolt-encryption'
import helpBoltRouting from './help/bolt-routing'
import helpClear from './help/clear'
import helpContains from './help/contains'
import helpCreate from './help/create'
import helpCreateConstraint from './help/create-constraint'
import helpCreateDatabase from './help/create-database'
import helpCreateIndex from './help/create-index'
import helpCreateRole from './help/create-role'
import helpCreateUser from './help/create-user'
import helpDelete from './help/delete'
import helpDeny from './help/deny'
import helpDetachDelete from './help/detach-delete'
import helpDropConstraint from './help/drop-constraint'
import helpDropDatabase from './help/drop-database'
import helpDropIndex from './help/drop-index'
import helpDropRole from './help/drop-role'
import helpDropUser from './help/drop-user'
import helpEndsWith from './help/ends-with'
import helpExplain from './help/explain'
import helpForeach from './help/foreach'
import helpGrant from './help/grant'
import helpGrantRole from './help/grant-role'
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
import helpRevoke from './help/revoke'
import helpRevokeRole from './help/revoke-role'
import helpSchema from './help/schema'
import helpServer from './help/server'
import helpServerUser from './help/server-user'
import helpSet from './help/set'
import helpShowDatabases from './help/show-databases'
import helpShowPrivileges from './help/show-privileges'
import helpShowRoles from './help/show-roles'
import helpShowUsers from './help/show-users'
import helpStartsWith from './help/starts-with'
import helpStyle from './help/style'
import helpTemplate from './help/template'
import helpUnfound from './help/unfound'
import helpUnknown from './help/unknown'
import helpUnwind from './help/unwind'
import helpWhere from './help/where'
import helpWith from './help/with'
// Play guides
import playConcepts from './play-guides/concepts'
import playCypher from './play-guides/cypher'
import playIconography from './play-guides/iconography'
import playIntro from './play-guides/intro'
import playLearn from './play-guides/learn'
import playMovieGraph from './play-guides/movie-graph'
import playNorthwindGraph from './play-guides/northwind-graph'
import playStart from './play-guides/start'
import playTypography from './play-guides/typography'
import playUnfound from './play-guides/unfound'
import playWritecode from './play-guides/write-code'
// Migrated sidebar guides
import guideConcepts from './sidebar-guides/concepts'
import guideCypher from './sidebar-guides/cypher'
import guideIntro from './sidebar-guides/intro'
import guideMovieGraph from './sidebar-guides/movie-graph'
import guideNorthwindGraph from './sidebar-guides/northwind-graph'
import guideUnfound from './sidebar-guides/unfound'

type AllDocumentation = {
  help: HelpDocs
  cypher: CypherDocs
  bolt: BoltDocs
  play: PlayDocs
  guide: GuideDocs
}
export type DocItem = {
  title: string
  subtitle?: string
  category?: string
  content?: JSX.Element | null
  footer?: JSX.Element
  slides?: JSX.Element[]
}

export type Guide = {
  currentSlide: number
  title: string
  identifier: string
  slides: JSX.Element[]
  isError?: boolean
}

type GuideDocs = {
  title: 'Built-in Browser guides'
  chapters: Record<BuiltInGuideIdentifier, Omit<Guide, 'currentSlide'>>
}

export type BuiltInGuideIdentifier =
  | 'concepts'
  | 'cypher'
  | 'intro'
  | 'movie-graph'
  | 'movieGraph'
  | 'movies'
  | 'northwind'
  | 'northwind-graph'
  | 'northwindGraph'
  | 'unfound'

// TypeGuard function to ts to understand that a string is a valid key
export const isBuiltInGuide = (name: string): name is BuiltInGuideIdentifier =>
  name in docs.guide.chapters

type PlayDocs = {
  title: 'Guides & Examples'
  chapters: Record<PlayChapter, DocItem>
}

type PlayChapter =
  | 'concepts'
  | 'cypher'
  | 'iconography'
  | 'intro'
  | 'learn'
  | 'movie-graph'
  | 'movieGraph'
  | 'movies'
  | 'northwind'
  | 'northwind-graph'
  | 'northwindGraph'
  | 'start'
  | 'typography'
  | 'unfound'
  | 'writeCode'

export function isPlayChapter(name: string): name is PlayChapter {
  return name in docs.play.chapters
}

type BoltDocs = { title: 'Bolt'; chapters: Record<BoltChapter, DocItem> }
type BoltChapter = 'boltEncryption' | 'boltRouting'
type CypherDocs = { title: 'Cypher'; chapters: Record<CypherChapter, DocItem> }
type CypherChapter =
  | 'alterUser'
  | 'contains'
  | 'create'
  | 'createConstraint'
  | 'createDatabase'
  | 'createIndex'
  | 'createRole'
  | 'createUser'
  | 'delete'
  | 'deny'
  | 'detachDelete'
  | 'dropConstraint'
  | 'dropDatabase'
  | 'dropIndex'
  | 'dropRole'
  | 'dropUser'
  | 'endsWith'
  | 'explain'
  | 'foreach'
  | 'grant'
  | 'grantRole'
  | 'loadCsv'
  | 'match'
  | 'merge'
  | 'param'
  | 'params'
  | 'profile'
  | 'queryPlan'
  | 'remove'
  | 'rest'
  | 'restDelete'
  | 'restGet'
  | 'restPost'
  | 'restPut'
  | 'return'
  | 'revoke'
  | 'revokeRole'
  | 'schema'
  | 'set'
  | 'showDatabases'
  | 'showPrivileges'
  | 'showRoles'
  | 'showUsers'
  | 'startsWith'
  | 'template'
  | 'unwind'
  | 'where'
  | 'with'

type HelpDocs = { title: 'Commands'; chapters: Record<HelpChapter, DocItem> }
type HelpChapter =
  | 'auto'
  | 'bolt'
  | 'clear'
  | 'commands'
  | 'cypher'
  | 'guides'
  | 'help'
  | 'history'
  | 'historyClear'
  | 'keys'
  | 'play'
  | 'queries'
  | 'server'
  | 'serverUser'
  | 'style'
  | 'unfound'
  | 'unknown'

const docs: AllDocumentation = {
  help: {
    title: 'Commands',
    chapters: {
      auto: helpAuto,
      bolt: helpBolt,
      clear: helpClear,
      commands: helpCommands,
      cypher: helpCypher,
      guides: helpPlay,
      help: helpHelp,
      history: helpHistory,
      historyClear: helpHistoryClear,
      keys: helpKeys,
      play: helpPlay,
      queries: helpQueries,
      server: helpServer,
      serverUser: helpServerUser,
      style: helpStyle,
      unfound: helpUnfound,
      unknown: helpUnknown
    }
  },
  cypher: {
    title: 'Cypher',
    chapters: {
      alterUser: helpAlterUser,
      contains: helpContains,
      create: helpCreate,
      createConstraint: helpCreateConstraint,
      createDatabase: helpCreateDatabase,
      createIndex: helpCreateIndex,
      createRole: helpCreateRole,
      createUser: helpCreateUser,
      delete: helpDelete,
      deny: helpDeny,
      detachDelete: helpDetachDelete,
      dropConstraint: helpDropConstraint,
      dropDatabase: helpDropDatabase,
      dropIndex: helpDropIndex,
      dropRole: helpDropRole,
      dropUser: helpDropUser,
      endsWith: helpEndsWith,
      explain: helpExplain,
      foreach: helpForeach,
      grant: helpGrant,
      grantRole: helpGrantRole,
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
      revoke: helpRevoke,
      revokeRole: helpRevokeRole,
      schema: helpSchema,
      set: helpSet,
      showDatabases: helpShowDatabases,
      showPrivileges: helpShowPrivileges,
      showRoles: helpShowRoles,
      showUsers: helpShowUsers,
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
      concepts: playConcepts,
      cypher: playCypher,
      iconography: playIconography,
      intro: playIntro,
      learn: playLearn,
      movieGraph: playMovieGraph,
      'movie-graph': playMovieGraph,
      movies: playMovieGraph,
      northwind: playNorthwindGraph,
      'northwind-graph': playNorthwindGraph,
      northwindGraph: playNorthwindGraph,
      start: playStart,
      typography: playTypography,
      unfound: playUnfound,
      writeCode: playWritecode
    }
  },
  // Guides are play-guides but migrated to be viewable in the sidebar
  guide: {
    title: 'Built-in Browser guides',
    chapters: {
      concepts: guideConcepts,
      cypher: guideCypher,
      intro: guideIntro,
      movies: guideMovieGraph,
      movieGraph: guideMovieGraph,
      'movie-graph': guideMovieGraph,
      northwind: guideNorthwindGraph,
      northwindGraph: guideNorthwindGraph,
      'northwind-graph': guideNorthwindGraph,
      unfound: guideUnfound
    }
  }
}

export default docs
