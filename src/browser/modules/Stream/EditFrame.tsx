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

import React, { Dispatch, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Action } from 'redux'
import styled from 'styled-components'
import Monaco, { MonacoHandles } from '../Editor/Monaco'
import FrameTemplate from '../Frame/FrameTemplate'
import { StyledFrameBody } from '../Frame/styled'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import {
  DARK_THEME,
  getTheme,
  LIGHT_THEME,
  OUTLINE_THEME
} from 'shared/modules/settings/settingsDuck'
import { Frame, GlobalState } from 'shared/modules/stream/streamDuck'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'

export type Theme =
  | typeof LIGHT_THEME
  | typeof OUTLINE_THEME
  | typeof DARK_THEME

interface EditFrameProps {
  frame: Frame
  runQuery: (query: string) => void
  theme: Theme
}

const ForceFullSizeFrameContent = styled.div`
  ${StyledFrameBody} {
    padding: 0;
  }
`

const EditFrame = ({ frame, runQuery, theme }: EditFrameProps): JSX.Element => {
  const monaco = useRef<MonacoHandles>(null)

  const [derivedTheme] = useDerivedTheme(theme, LIGHT_THEME) as [Theme]

  useEffect(() => {
    const themeMap = {
      [LIGHT_THEME]: 'vs',
      [OUTLINE_THEME]: 'hc-black',
      [DARK_THEME]: 'vs-dark'
    }
    monaco.current?.setTheme(themeMap[derivedTheme])
  }, [derivedTheme])

  return (
    <ForceFullSizeFrameContent>
      <FrameTemplate
        contents={
          <Monaco id={frame.id} ref={monaco} value={frame.query}></Monaco>
        }
        header={frame}
        runQuery={() => {
          const value = monaco.current?.getValue() || ''
          runQuery(value)
        }}
      />
    </ForceFullSizeFrameContent>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  theme: getTheme(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  runQuery(query: string) {
    dispatch(executeCommand(query))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditFrame)
