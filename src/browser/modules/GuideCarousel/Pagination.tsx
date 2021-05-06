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
type PaginationProps = {
  gotoIndex: (index: number) => void
  itemCount: number
  selectedIndex: number
}
type DotDotDot = '...'

const range = (from: number, to: number) =>
  Array.from({ length: from ? to - from + 1 : to }, (_, i) => i + from)

export function paginationHelper(
  itemCount: number,
  selectedIndex: number
): (number | DotDotDot)[] {
  /* Pagination example (C denotes current and blank steps replaced with ...)
     C 2 3 4 5       9 
     1 C 3 4 5       9 
     1 2 C 4 5       9 
     1 2 3 C 5       9 
     1     4 C 6     9 
     1       5 C 7 8 9 
     1       5 6 C 8 9
     1       5 6 7 C 9
     1       5 6 7 8 C
*/
  const lastIndex = itemCount - 1
  const outOfBounds = selectedIndex < 0 || selectedIndex > lastIndex
  if (outOfBounds) return []

  const baseNumbers = range(0, itemCount)
  // no split
  if (itemCount <= 7) return baseNumbers

  // early splits
  if (selectedIndex < 4) {
    return [...range(0, 5), '...', lastIndex]
  }

  // late splits
  const isInlastFiveItems = itemCount - selectedIndex < 5
  if (isInlastFiveItems) {
    return [0, '...', ...range(itemCount - 5, lastIndex)]
  }

  // two splits
  return [
    0,
    '...',
    selectedIndex - 1,
    selectedIndex,
    selectedIndex + 1,
    '...',
    lastIndex
  ]
}

function Pagination({
  gotoIndex,
  itemCount,
  selectedIndex
}: PaginationProps): JSX.Element {
  return (
    <>
      {paginationHelper(itemCount, selectedIndex).map((symbol, index) => {
        if (symbol === '...') {
          return <span key={index}>…</span>
        } else {
          return (
            <span key={index} onClick={() => gotoIndex(symbol)}>
              {symbol + 1}
            </span>
          )
        }
      })}
    </>
  )
}
export default Pagination
