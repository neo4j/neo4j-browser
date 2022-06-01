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
import React from 'react'

import Filter from '../assets/filter.svg'
import GroupBy from '../assets/group-by.svg'
import SortAsc from '../assets/sort1.svg'
import SortDesc from '../assets/sort2.svg'
import Sort from '../assets/sort.svg'
import { RELATABLE_ICONS } from '../relatable.types'

export interface IRelatableIconProps {
  name: RELATABLE_ICONS
}

export default function RelatableIcon({ name }: IRelatableIconProps) {
  return <img className="relatable__icon" alt={name} src={getNameSrc(name)} />
}

function getNameSrc(name: RELATABLE_ICONS) {
  switch (name) {
    case RELATABLE_ICONS.SORT:
      return Sort
    case RELATABLE_ICONS.SORT_ASC:
      return SortAsc
    case RELATABLE_ICONS.SORT_DESC:
      return SortDesc
    case RELATABLE_ICONS.FILTER:
      return Filter
    case RELATABLE_ICONS.GROUP_BY:
      return GroupBy
    default:
      throw new Error(`${name} is not a valid icon`)
  }
}
