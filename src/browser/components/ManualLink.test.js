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
import { render } from '@testing-library/react'

import { ManualLink } from './ManualLink'

const tests = [
  [
    { neo4jVersion: null, chapter: 'graph-algorithms', page: '/' },
    'https://neo4j.com/docs/graph-algorithms/current/'
  ],
  [
    {
      neo4jVersion: '3.5.12',
      chapter: 'cypher-manual',
      page: '/schema/constraints/'
    },
    'https://neo4j.com/docs/cypher-manual/3.5/schema/constraints/'
  ],
  [
    { neo4jVersion: '4.0.0-beta03mr03', chapter: 'driver-manual', page: '' },
    'https://neo4j.com/docs/driver-manual/4.0-preview/'
  ],
  [
    {
      neo4jVersion: '3.4.11',
      chapter: 'driver-manual',
      page: '',
      minVersion: '4.0.0'
    },
    'https://neo4j.com/docs/driver-manual/4.0/'
  ],
  [
    {
      neo4jVersion: '4.0.0-rc01',
      chapter: 'driver-manual',
      page: '',
      minVersion: '3.5.0'
    },
    'https://neo4j.com/docs/driver-manual/4.0-preview/'
  ],
  [
    { chapter: 'driver-manual', page: '/', minVersion: '3.5.0' },
    'https://neo4j.com/docs/driver-manual/3.5/'
  ]
]

test.each(tests)('Render correct url for props %o', (props, expected) => {
  const { getByText } = render(
    <ManualLink {...props}>link to manual</ManualLink>
  )

  const url = getByText('link to manual').getAttribute('href')
  expect(url).toEqual(expected)
})

const movedPages = [
  [
    { neo4jVersion: '3.5.0', page: '/administration/' },
    {
      text: 'Cypher Schema',
      url: 'https://neo4j.com/docs/cypher-manual/3.5/schema/'
    }
  ],
  [
    { neo4jVersion: '4.0.0', page: '/administration/' },
    {
      text: 'link to manual',
      url: 'https://neo4j.com/docs/cypher-manual/4.0/administration/'
    }
  ],
  [
    { page: '/administration/' },
    {
      text: 'link to manual',
      url: 'https://neo4j.com/docs/cypher-manual/current/administration/'
    }
  ]
]

test.each(movedPages)(
  'Render correct url for moved page %o',
  (props, expected) => {
    const { getByText } = render(
      <ManualLink chapter="cypher-manual" {...props}>
        link to manual
      </ManualLink>
    )
    const url = getByText(expected.text).getAttribute('href')
    expect(url).toEqual(expected.url)
  }
)
