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
import { render, screen } from '@testing-library/react'
import React from 'react'

import {
  VersionConditionalDoc,
  VersionConditionalDocProps
} from 'browser-components/VersionConditionalDoc'

const tests: [Omit<VersionConditionalDocProps, 'children'>, boolean][] = [
  [
    { neo4jVersion: '3.5.0', versionCondition: '>=4.3', includeCurrent: true },
    false
  ],
  [
    { neo4jVersion: null, versionCondition: '>=4.3', includeCurrent: true },
    true
  ],
  [
    { neo4jVersion: '4.3.0', versionCondition: '>=4.3', includeCurrent: false },
    true
  ],
  [{ neo4jVersion: null, versionCondition: '', includeCurrent: false }, false],
  [
    {
      neo4jVersion: '4.2.0',
      versionCondition: '>=4.2 <4.3',
      includeCurrent: false
    },
    true
  ]
]

test.each(tests)(
  'Conditionally render element for props %o',
  (props, expected) => {
    render(<VersionConditionalDoc {...props}>Contents</VersionConditionalDoc>)
    const present = screen.queryByText('Contents')
    expect(present !== null).toEqual(expected)
  }
)
