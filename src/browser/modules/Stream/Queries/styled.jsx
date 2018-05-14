/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import styled from 'styled-components'
import { FrameButton } from 'browser-components/buttons'
import styles from './toggleStyles.css'

export const Code = styled.code`
  white-space: nowrap;
  overflow: hidden;
  color: #c7254e;
  background-color: #f9f2f4;
  border-radius: 4px;
`
export const StyledTableWrapper = styled.div`margin: 20px 10px;`
export const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
`
export const StyledTh = styled.th`
  text-align: left;
  height: 30px;
  vertical-align: top;
  padding: 5px;
  width: {props => props.width || 'auto'};
`
export const StyledTd = styled.td`
  padding: 5px;
  width: {props => props.width || 'auto'};
  text-overflow: ellipsis;
  overflow: hidden;
`
export const StyledHeaderRow = styled.tr`
  border-top: ${props => props.theme.inFrameBorder};
  border-bottom: ${props => props.theme.inFrameBorder};
`

export const StatusbarWrapper = styled.div`width: 100%;`

export const StyledStatusBar = styled.div`
  min-height: 39px;
  line-height: 39px;
  color: #788185;
  background-color: #fff;
  white-space: nowrap;
  font-size: 13px;
  position: relative;
  float: right;
  overflow: hidden;
  border-top: 1px solid #e6e9ef;
  margin-bottom: -39px;
  padding-left: 16px;
  margin-top: 0;
  width: 100%;
`

export const RefreshQueriesButton = styled(FrameButton)`float: right;`

export const AutoRefreshSpan = styled.span`
  float: right;
  margin-right: 5px;
`

const ToggleLabel = styled.label`cursor: pointer;`

export const AutoRefreshToggle = props => {
  return (
    <ToggleLabel>
      AUTO-REFRESH &nbsp;
      <input
        type='checkbox'
        checked={props.checked}
        onClick={props.onClick}
        className={styles['toggle-check-input']}
      />
      <span className={styles['toggle-check-text']} />
    </ToggleLabel>
  )
}
