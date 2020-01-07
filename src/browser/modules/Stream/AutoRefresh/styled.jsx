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
import styled from 'styled-components'
import { FrameButton } from 'browser-components/buttons'
import styles from './toggleStyles.css'

export const StatusbarWrapper = styled.div`
  width: 100%;
`

export const StyledStatusBar = styled.div`
  min-height: 39px;
  line-height: 39px;
  white-space: nowrap;
  font-size: 13px;
  color: ${props => props.theme.secondaryText};
  position: relative;
  overflow: hidden;
  margin-top: 0;
  width: 100%;
`

export const RefreshQueriesButton = styled(FrameButton)`
  float: right;
`

export const AutoRefreshSpan = styled.span`
  float: right;
  margin-right: 10px;
`

const ToggleLabel = styled.label`
  cursor: pointer;
`

export const AutoRefreshToggle = props => {
  return (
    <ToggleLabel>
      AUTO-REFRESH &nbsp;
      <input
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
        className={styles['toggle-check-input']}
      />
      <span className={styles['toggle-check-text']} />
    </ToggleLabel>
  )
}
