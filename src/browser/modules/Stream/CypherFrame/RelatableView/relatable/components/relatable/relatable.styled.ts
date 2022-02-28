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
import { join } from 'lodash-es'
import styled from 'styled-components'

import {
  createRowStateClasses,
  createToolbarStateClasses
} from '../../utils/relatable-state-classes'

export const StyleWrapper = styled.div`
  .relatable__table {
    position: relative;
  }

  .relatable__icon {
    height: 14px;
    margin-right: 0.8em;
  }

  .relatable__table-header-cell {
    position: relative;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .relatable__expanded-row-table .relatable__table-header-cell {
    position: static;
  }

  .relatable__table-header-cell--has-actions:hover {
    background-color: #f3f3f3;
    cursor: pointer;
  }

  .relatable__column-actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .relatable__column-actions-header .relatable__icon {
    margin: 0;
    margin-left: 10px;
  }

  .relatable__column-actions-header [class*='relatable__table-column-state'] {
    padding: 5px;
    border-radius: 5px;
    margin: 0;
    margin-left: 5px;
  }

  .relatable__column-actions-header
    [class*='relatable__table-column-state']:first-of-type {
    margin-left: 10px;
  }

  .relatable__table-row-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-evenly;
  }

  .relatable__table-row-actions {
    min-height: 45px;
    min-width: 30px;
  }

  .relatable__table-header-cell .relatable__table-row-actions {
    min-height: 0;
  }

  .relatable__table-row-actions-cell {
    user-select: none;
    position: relative;
  }

  .relatable__table-row-number,
  .relatable__table-header-number {
    opacity: 0.5;
    top: 0;
    left: 0;
    position: absolute;
    margin: 0;
    border-radius: 0;
    font-size: 8px;
    border-bottom-right-radius: 0.28571429rem;
  }

  .relatable__table-header-number {
    position: static;
  }

  .relatable__row-expander {
    cursor: pointer;
    padding: 2px;
  }

  .relatable__table-json-cell {
    margin: 0;
  }

  .relatable__toolbar {
    min-height: 42px;
  }

  ${join(createToolbarStateClasses(), '\n\n')}
  ${join(createRowStateClasses(), '\n\n')}
  
  .relatable__table-body-cell-loader {
    height: 18px;
    width: 75%;
    display: block;
    background: linear-gradient(to right, #eee 20%, #ddd 50%, #eee 80%);
    background-size: 500px 100px;
    animation-name: relatable__table-moving-gradient;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }

  .relatable__table-body-row:nth-of-type(even)
    .relatable__table-body-cell-loader {
    width: 70%;
  }

  @keyframes relatable__table-moving-gradient {
    0% {
      background-position: -250px 0;
    }
    100% {
      background-position: 250px 0;
    }
  }

  .relatable__pagination {
    display: flex;
    justify-content: space-between;
  }

  .relatable__pagination-size-setter.field label {
    font-weight: normal !important;
  }
`
