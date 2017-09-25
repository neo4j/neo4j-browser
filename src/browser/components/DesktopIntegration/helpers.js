/*
 * Copyright (c) 2002-2017 "Neo4j, Inc,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

export const getActiveGraph = (context = {}) => {
  if (!context) return null
  const { projects } = context
  if (!Array.isArray(projects)) return null
  const activeProject = projects.find(project => {
    if (!project) return false
    if (!(project.graphs && Array.isArray(project.graphs))) return false
    return project.graphs.find(({ status }) => status === 'ACTIVE')
  })
  if (!activeProject) return null
  return activeProject.graphs.find(({ status }) => status === 'ACTIVE')
}

export const getCredentials = (type, connection) => {
  if (!connection) return undefined
  const { configuration = null } = connection
  if (
    !(
      configuration &&
      configuration.constructor &&
      configuration.constructor === Object
    )
  ) {
    return undefined
  }
  if (
    !(
      configuration.protocols &&
      configuration.protocols.constructor &&
      configuration.protocols.constructor === Object
    )
  ) {
    return undefined
  }
  if (typeof configuration.protocols[type] === 'undefined') {
    return undefined
  }
  return configuration.protocols[type]
}

// XXX_YYY -> onXxxYyy
export const eventToHandler = type => {
  if (typeof type !== 'string') return undefined
  return (
    'on' +
    splitOnUnderscore(type)
      .filter(notEmpty)
      .map(toLower)
      .map(upperFirst)
      .join('')
  )
}
const notEmpty = str => str.length > 0
const splitOnUnderscore = str => str.split('_')
const toLower = str => str.toLowerCase()
const upperFirst = str => str[0].toUpperCase() + str.substring(1)
