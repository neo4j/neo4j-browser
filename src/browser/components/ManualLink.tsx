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
import React from 'react'
import { connect } from 'react-redux'
import semver from 'semver'

import { DrawerExternalLink } from './drawer/drawer-styled'
import { formatDocVersion } from 'browser/modules/Sidebar/docsUtils'
import { GlobalState } from 'project-root/src/shared/globalState'
import { getRawVersion } from 'shared/modules/dbMeta/dbMetaDuck'

const oldPages: { [key: string]: { oldPage: string; oldContent: string } } = {
  '/administration/indexes-for-search-performance/': {
    oldPage: 'schema/index/',
    oldContent: 'Schema indexes'
  },
  '/administration/constraints/': {
    oldPage: 'schema/constraints/',
    oldContent: 'Schema constraints'
  },
  '/administration/': {
    oldPage: 'schema/',
    oldContent: 'Cypher Schema'
  }
}

const newPages: { [key: string]: { newPage: string; newContent: string } } = {
  '/administration/indexes-for-search-performance/': {
    newPage: 'indexes-for-search-performance/',
    newContent: 'Indexes'
  },
  '/administration/constraints/': {
    newPage: 'constraints/',
    newContent: 'Constraints'
  },
  '/administration/': {
    newPage: '',
    newContent: 'Cypher Manual'
  }
}

const isPageOld = (
  chapter: string,
  page: string,
  neo4jVersion: string | null
) =>
  chapter === 'cypher-manual' &&
  oldPages[page] &&
  neo4jVersion &&
  semver.satisfies(neo4jVersion, '<4.0.0-alpha.1')

const isPageNew = (
  chapter: string,
  page: string,
  neo4jVersion: string | null
) =>
  chapter === 'cypher-manual' &&
  newPages[page] &&
  ((neo4jVersion && semver.satisfies(neo4jVersion, '>=4.3')) ||
    neo4jVersion === null) // if no version is available, we treat it like the newest version.

export type ManualLinkProps = {
  chapter: string
  page: string
  children: React.ReactNode
  minVersion?: string | null
  neo4jVersion: string | null
}
export function ManualLink({
  chapter,
  page,
  children,
  neo4jVersion,
  minVersion = null
}: ManualLinkProps): JSX.Element {
  let cleanPage = page.replace(/^\//, '')
  let content = children
  if (isPageOld(chapter, page, neo4jVersion)) {
    cleanPage = oldPages[page].oldPage
    content = oldPages[page].oldContent
  } else if (isPageNew(chapter, page, neo4jVersion)) {
    cleanPage = newPages[page].newPage
    content = newPages[page].newContent
  }

  let version = formatDocVersion(neo4jVersion)
  if (
    minVersion &&
    (!neo4jVersion || semver.cmp(neo4jVersion, '<', minVersion))
  ) {
    version = formatDocVersion(minVersion)
  }

  const url = `https://neo4j.com/docs/${chapter}/${version}/${cleanPage}`

  return <DrawerExternalLink href={url}>{content}</DrawerExternalLink>
}

const mapStateToProps = (state: GlobalState) => ({
  neo4jVersion: getRawVersion(state)
})

export default connect(mapStateToProps)(ManualLink)
