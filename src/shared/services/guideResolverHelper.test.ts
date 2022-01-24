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
import * as guideResolverHelper from './guideResolverHelper'

describe('tryGetRemoteInitialSlideFromUrl', () => {
  it('extracts initial slide hashbangs from a string', () => {
    expect(
      guideResolverHelper.tryGetRemoteInitialSlideFromUrl('foo#slide-1')
    ).toEqual(1)
    expect(
      guideResolverHelper.tryGetRemoteInitialSlideFromUrl(
        'http://foo.com#slide-2'
      )
    ).toEqual(2)
    expect(
      guideResolverHelper.tryGetRemoteInitialSlideFromUrl(
        'http://www.google.com/yarr/#slide-21'
      )
    ).toEqual(21)
  })
  it('returns 0 when no valid hashbang found', () => {
    expect(guideResolverHelper.tryGetRemoteInitialSlideFromUrl('foo')).toEqual(
      0
    )
    expect(
      guideResolverHelper.tryGetRemoteInitialSlideFromUrl(
        'http://foo.com#sloide-2'
      )
    ).toEqual(0)
    expect(
      guideResolverHelper.tryGetRemoteInitialSlideFromUrl(
        'http://www.google.com/yarr/#slide-fooo'
      )
    ).toEqual(0)
  })
})
