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
import { withBus } from 'react-suber'
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import { StyledCodeBlock } from './styled'
import { executeCommand } from 'shared/modules/commands/commandsDuck'

const setOnClick = (bus, code) => {
  code = Array.isArray(code) ? code.join('') : code
  bus.send(SET_CONTENT, setContent(code))
}
const execOnClick = (bus, code) => {
  const cmd = executeCommand(code)
  bus.send(cmd.type, cmd)
}

export const ClickToCode = ({
  CodeComponent = StyledCodeBlock,
  bus,
  code,
  execute = false,
  children,
  className,
  ...rest
}) => {
  if (!children || children.length === 0) return null
  code = code || children
  const fn = !execute
    ? () => setOnClick(bus, code)
    : () => execOnClick(bus, code)
  return (
    <CodeComponent {...rest} onClick={fn}>
      {children}
    </CodeComponent>
  )
}

export default withBus(ClickToCode)
