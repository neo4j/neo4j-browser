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
import { H1, H2, H3, H4, H5 } from './Headers'

describe('headers', () => {
  test('H1 renders', () => {
    render(<H1 />)
  })
  test('H2 renders', () => {
    render(<H2 />)
  })
  test('H3 renders', () => {
    render(<H3 />)
  })
  test('H4 renders', () => {
    render(<H4 />)
  })
  test('H5 renders', () => {
    render(<H5 />)
  })
})
