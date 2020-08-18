/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { getVersion } from 'shared/modules/dbMeta/dbMetaDuck'
import { formatDocVersion } from 'browser/modules/Sidebar/Documents'

const movedPages = {
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

const isPageMoved = (chapter, page, neo4jVersion) =>
  chapter === 'cypher-manual' &&
  movedPages[page] &&
  neo4jVersion &&
  semver.satisfies(neo4jVersion, '<4.0.0-alpha.1')

export function ManualLink({
  chapter,
  page,
  children,
  neo4jVersion,
  minVersion
}) {
  let cleanPage = page.replace(/^\//, '')
  let content = children
  if (isPageMoved(chapter, page, neo4jVersion)) {
    cleanPage = movedPages[page].oldPage
    content = movedPages[page].oldContent
  }

  let version = formatDocVersion(neo4jVersion)
  if (
    minVersion &&
    (!neo4jVersion || semver.cmp(neo4jVersion, '<', minVersion))
  ) {
    version = formatDocVersion(minVersion)
  }

  const url = `https://neo4j.com/docs/${chapter}/${version}/${cleanPage}`

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {content}
    </a>
  )
}

const mapStateToProps = state => ({
  neo4jVersion: getVersion(state)
})

export default connect(mapStateToProps, null)(ManualLink)
