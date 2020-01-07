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
import { transformHelpTopicToCommand } from 'services/commandUtils'

// Avoid duplication and don list error-pages
const unlistedCommands = [
  'unfound',
  'unknown',
  'help',
  'movies',
  'northwind',
  'guides'
]

const categorize = commands => {
  const categories = {
    browserUiCommands: { title: 'Browser UI Commands' },
    boltProtocol: { title: 'Bolt Protocol' },
    cypherQueries: { title: 'Cypher Queries' },
    executionPlans: { title: 'Execution Plans' },
    cypherHelp: { title: 'Cypher Help' },
    schemaClauses: { title: 'Schema Clauses' },
    administration: { title: 'Administration' },
    security: { title: 'Security' },
    cypherPredicates: { title: 'Cypher Predicates' },
    restApiCommands: { title: 'Rest API Commands' },
    guides: { title: 'Guides' },
    graphExamples: { title: 'Graph Examples' },
    undefined: { title: 'Other' }
  }

  Object.entries(commands).forEach(command => {
    const value = command[1]
    const cmd = transformHelpTopicToCommand(command[0])

    if (unlistedCommands.includes(cmd)) {
      return
    }

    const newValue = {
      command: cmd,
      title: value.title
    }

    if (value.category && categories[value.category]) {
      if (!(categories[value.category] || {}).entries) {
        categories[value.category].entries = []
      }
      categories[value.category].entries.push(newValue)
    } else {
      if (!(categories.undefined || {}).entries) {
        categories.undefined.entries = []
      }
      categories.undefined.entries.push(newValue)
    }
  })

  return Object.entries(categories)
    .filter(category => (category[1].entries || []).length)
    .map(category => category[1])
}

const Entry = ({ type, command }) => {
  const topic = type === 'play' ? 'play' : 'help'
  const attrs = { [`${topic}-topic`]: command.command }
  return (
    <tr>
      <th>{command.title}</th>
      <td>
        <a {...attrs}>{`:${topic} ${command.command}`}</a>
      </td>
    </tr>
  )
}

const Section = ({ section, type, i }) => {
  return (
    <>
      <tr className="table-help--subheader">
        <th>{section.title}</th>
        <th />
      </tr>
      {section.entries.map((command, k) => (
        <Entry
          key={`${command.title}-${i}-${k}`}
          type={type}
          command={command}
        />
      ))}
    </>
  )
}

const Categories = ({ types, type, i }) => {
  const showCategoryHeadline = !!Object.keys(types).length
  return (
    <>
      {showCategoryHeadline && (
        <tr className="table-help--header">
          <th>{types[type].title}</th>
          <th />
        </tr>
      )}
      {types[type].categories.map((section, j) => (
        <Section
          key={`${type}-${i}-${j}`}
          section={section}
          type={type}
          i={i}
        />
      ))}
    </>
  )
}

export const DynamicTopics = ({ docs = {}, description = '', filter = [] }) => {
  let filteredDocs = {}
  if (filter.length) {
    Object.keys(docs)
      .filter(type => filter.includes(type))
      .forEach(type => {
        filteredDocs[type] = docs[type]
      })
  } else {
    filteredDocs = docs
  }

  const types = {}
  Object.keys(filteredDocs).map(key => {
    const { title, chapters } = filteredDocs[key]
    types[key] = {
      title,
      categories: categorize(chapters)
    }
  })

  return (
    <>
      {description && <React.Fragment>{description}</React.Fragment>}
      {Object.keys(types) && (
        <table className="table-condensed table-help table-help--commands">
          <tbody>
            {Object.keys(types).map((type, i) => (
              <Categories
                key={`${type}-${i}`}
                types={types}
                type={type}
                i={i}
              />
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
