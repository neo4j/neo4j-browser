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

import React, { useState } from 'react'
import { transformHelpTopicToCommand } from 'services/commandUtils'

const title = 'Commands'
const subtitle = 'Typing commands is 1337'
const category = 'browserUiCommands'

const categorize = commands => {
  const categories = {
    browserUiCommands: { title: 'Browser UI Commands' },
    boltProtocol: { title: 'Bolt Protocol' },
    cypherQueries: { title: 'Cypher Queries' },
    executionPlans: { title: 'Execution Plans' },
    cypherHelp: { title: 'Cypher Help' },
    schemaClauses: { title: 'Schema Clauses' },
    cypherPredicates: { title: 'Cypher Predicates' },
    restApiCommands: { title: 'Rest API Commands' },
    guides: { title: 'Guides' },
    graphExamples: { title: 'Graph Examples' },
    undefined: { title: 'Other' }
  }

  Object.entries(commands).forEach(command => {
    const value = command[1]
    const cmd = transformHelpTopicToCommand(command[0])

    if (cmd === 'unfound' || cmd === 'unknown') {
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
      if (!(categories['undefined'] || {}).entries) {
        categories['undefined'].entries = []
      }
      categories['undefined'].entries.push(newValue)
    }
  })

  return Object.entries(categories)
    .filter(category => (category[1].entries || []).length)
    .map(category => category[1])
}

const Content = ({ docs }) => {
  const { help, play } = docs
  const [types, setTypes] = useState({})

  if (!Object.keys(types).length) {
    setTypes({
      help: {
        title: 'Help',
        categories: categorize(help)
      },
      play: {
        title: 'Play',
        categories: categorize(play)
      }
    })
  }

  return (
    <React.Fragment>
      <p>
        In addition to composing and running Cypher queries, the editor bar up
        above ↑ understands a few client-side commands, which begin with a
        <code>:</code>. Without a colon, we'll assume you're trying to enter a
        Cypher query.
      </p>
      <table className='table-condensed table-help table-help--commands'>
        <tbody>
          {Object.keys(types).map((type, i) => {
            const usage = type === 'help' ? 'topic' : 'guide | url'
            return (
              <React.Fragment key={`${type}-${i}`}>
                <tr className='table-help--header'>
                  <th>{types[type].title}</th>
                  <th />
                </tr>
                <tr>
                  <th>Usage:</th>
                  <td>
                    <code>{`:${type} <${usage}>`}</code>
                  </td>
                </tr>
                {types[type].categories.map((section, j) => {
                  return (
                    <React.Fragment key={`${type}-${i}-${j}`}>
                      <tr className='table-help--subheader'>
                        <th>{section.title}</th>
                        <th />
                      </tr>
                      {section.entries.map((command, k) => {
                        const attrs = { [`${type}-topic`]: command.command }
                        return (
                          <tr key={`${command.title}-${i}-${k}`}>
                            <th>{command.title}:</th>
                            <td>
                              <a {...attrs}>{`:${type} ${command.command}`}</a>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </React.Fragment>
  )
}

export default { title, subtitle, category, Content, content: null }
