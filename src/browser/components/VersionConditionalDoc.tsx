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

import { GlobalState } from 'project-root/src/shared/globalState'
import { getRawVersion } from 'shared/modules/dbMeta/dbMetaDuck'

export type VersionConditionalDocProps = {
  versionCondition: string
  children: React.ReactNode
  neo4jVersion: string | null
  includeCurrent: boolean
}
export function VersionConditionalDoc({
  versionCondition,
  children,
  neo4jVersion,
  includeCurrent = false
}: VersionConditionalDocProps): JSX.Element {
  if (
    (includeCurrent && neo4jVersion === null) ||
    (neo4jVersion !== null &&
      semver.valid(neo4jVersion) &&
      semver.satisfies(neo4jVersion, versionCondition))
  ) {
    return <>{children}</>
  } else {
    return <></>
  }
}

const mapStateToProps = (state: GlobalState) => ({
  neo4jVersion: getRawVersion(state)
})

export default connect(mapStateToProps)(VersionConditionalDoc)
