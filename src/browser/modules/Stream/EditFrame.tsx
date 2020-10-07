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

import React, { Dispatch, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Action } from 'redux'
import styled from 'styled-components'

import Monaco, {
  VS_DARK_THEME,
  VS_HIGH_CONTRAST_THEME,
  VS_LIGHT_THEME,
  VSTheme
} from '../Editor/Monaco'
import FrameTemplate from '../Frame/FrameTemplate'
import { StyledFrameBody } from '../Frame/styled'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import {
  DARK_THEME,
  getTheme,
  LIGHT_THEME,
  OUTLINE_THEME,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { Frame, GlobalState } from 'shared/modules/stream/streamDuck'

export type BrowserTheme =
  | typeof LIGHT_THEME
  | typeof OUTLINE_THEME
  | typeof DARK_THEME

interface EditFrameProps {
  browserTheme: BrowserTheme
  enableMultiStatementMode: boolean
  frame: Frame
  runQuery: (query: string) => void
}

const ForceFullSizeFrameContent = styled.div`
  ${StyledFrameBody} {
    padding: 0;
  }
`

const EditFrame = (props: EditFrameProps): JSX.Element => {
  const [text, setText] = useState(props.frame.query)

  const [derivedTheme] = useDerivedTheme(props.browserTheme, LIGHT_THEME) as [
    BrowserTheme
  ]
  const [theme, setTheme] = useState<VSTheme>(VS_LIGHT_THEME)

  useEffect(() => {
    const themeMap: { [key in BrowserTheme]: VSTheme } = {
      [LIGHT_THEME]: VS_LIGHT_THEME,
      [OUTLINE_THEME]: VS_HIGH_CONTRAST_THEME,
      [DARK_THEME]: VS_DARK_THEME
    }
    setTheme(themeMap[derivedTheme])
  }, [derivedTheme])

  return (
    <ForceFullSizeFrameContent>
      <FrameTemplate
        contents={
          <Monaco
            id={props.frame.id}
            enableMultiStatementMode={props.enableMultiStatementMode}
            onChange={setText}
            theme={theme}
            value={text}
          ></Monaco>
        }
        header={props.frame}
        runQuery={() => {
          props.runQuery(text)
        }}
      />
    </ForceFullSizeFrameContent>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  browserTheme: getTheme(state),
  enableMultiStatementMode: shouldEnableMultiStatementMode(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  runQuery(query: string) {
    dispatch(executeCommand(query))
    // TODO: dispatch update frame.query with text
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(EditFrame)
