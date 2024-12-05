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
import { useDispatch } from 'react-redux'

import { StyledCodeBlock } from './styled'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { setContent } from 'shared/modules/editor/editorDuck'

interface ClickToCodeProps {
  CodeComponent?: React.ComponentType<any>
  code?: string | string[]
  execute?: boolean
  children?: React.ReactNode
  className?: string
  [key: string]: any
}

export const ClickToCode: React.FC<ClickToCodeProps> = ({
  CodeComponent = StyledCodeBlock,
  code,
  execute = false,
  children,
  className,
  ...rest
}) => {
  const dispatch = useDispatch()

  if (!children || React.Children.count(children) === 0) return null
  
  const codeToUse = code || children
  const finalCode = Array.isArray(codeToUse) ? codeToUse.join('') : codeToUse

  const handleClick = () => {
    if (!execute) {
      dispatch(setContent(finalCode))
    } else {
      dispatch(executeCommand(finalCode, { source: commandSources.button }))
    }
  }

  return (
    <CodeComponent {...rest} onClick={handleClick}>
      {children}
    </CodeComponent>
  )
}

export default ClickToCode
