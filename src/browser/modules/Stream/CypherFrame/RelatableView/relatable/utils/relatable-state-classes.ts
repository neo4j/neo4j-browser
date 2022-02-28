/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { entries, kebabCase, keys, map, reduce } from 'lodash-es'

import { ROW_STATE_CLASSES, TOOLBAR_STATE_CLASSES } from '../constants'

export function getRowClasses(row: any) {
  return `relatable__table-row relatable__table-body-row ${getRowStateClasses(
    row
  )}`
}

export function createRowStateClasses() {
  return map(entries(ROW_STATE_CLASSES), ([state, bgColor]) =>
    bgColor
      ? `.${getRowStateClass(state)} {
        background-color: ${bgColor};
      }`
      : ''
  )
}

export function createToolbarStateClasses() {
  return map(
    entries(TOOLBAR_STATE_CLASSES),
    ([state, bgColor]) => `
    /* need to win over semantic specificity */
    .menu .label.${getToolbarStateClass(state)} {
      background-color: ${bgColor};
    }
  `
  )
}

export function getToolbarStateClass(state: string) {
  return `relatable__toolbar-label--${kebabCase(state)}`
}

function getRowStateClasses(row: any) {
  return reduce(
    keys(ROW_STATE_CLASSES),
    (agg, state) => (row[state] ? `${agg} ${getRowStateClass(state)}` : agg),
    ''
  )
}

function getRowStateClass(state: string) {
  return `relatable__table-row-state--${kebabCase(state)}`
}
