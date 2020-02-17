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
import { connect } from 'react-redux'
import styled from 'styled-components'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { getCmdChar } from 'shared/modules/settings/settingsDuck'

const ExecutableIcon = styled.i`
  padding-right: 4px;
`
const ExecutableText = styled.a`
  border-radius: 3px;
  border: 1px solid #dadada;
  display: inline-block;
  font-family: Monaco, 'Courier New', Terminal, monospace;
  font-size: 12px;
  line-height: 18px;
  margin-bottom: 5px;
  margin-right: 5px;
  padding: 0 4px;
  cursor: pointer;
  text-decoration: none;
  background-color: ${props => props.theme.topicBackground};
  color: ${props => props.theme.topicText};
`
export const TextCommand = ({ command, onClick, cmdchar, ...rest }) => {
  return (
    <ExecutableText {...rest} onClick={() => onClick(`${cmdchar}${command}`)}>
      <ExecutableIcon className="fa fa-play-circle-o" />
      {cmdchar}
      {command}
    </ExecutableText>
  )
}

const mapStateToProps = state => {
  return {
    cmdchar: getCmdChar(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClick: cmd => dispatch(executeCommand(cmd))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TextCommand)
