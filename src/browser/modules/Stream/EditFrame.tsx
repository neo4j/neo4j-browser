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

import React, { Dispatch, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action } from 'redux'
import styled from 'styled-components'
import { Bus } from 'suber'

import { BrowserTheme } from '../Editor/CypherMonacoThemes'
import Monaco, { MonacoHandles } from '../Editor/Monaco'
import FrameTemplate from '../Frame/FrameTemplate'
import { StyledFrameBody, StyledFrameContents } from '../Frame/styled'
import useDerivedTheme from 'browser-hooks/useDerivedTheme'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  getTheme,
  LIGHT_THEME,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { getOpenDrawer } from 'shared/modules/sidebar/sidebarDuck'
import { Frame } from 'shared/modules/stream/streamDuck'

interface EditFrameProps {
  browserTheme: BrowserTheme
  bus: Bus
  drawer: string | null
  enableMultiStatementMode: boolean
  frame: Frame
  runQuery: (query: string) => void
}

const ForceFullSizeFrameContent = styled.div`
  ${StyledFrameBody} {
    padding: 0;
    overflow: unset;
  }
  ${StyledFrameContents} {
    overflow: unset;
  }
`

const EditFrame = (props: EditFrameProps): JSX.Element => {
  const [text, setText] = useState(props.frame.query)

  const [theme] = useDerivedTheme(props.browserTheme, LIGHT_THEME) as [
    BrowserTheme
  ]
  const editorRef = useRef<MonacoHandles>(null)

  useEffect(() => {
    // After the sidebar animation has finished, the editor needs to resize its width
    setTimeout(() => editorRef.current?.resize(true, 275), 200)
  }, [editorRef, props.drawer])

  return (
    <ForceFullSizeFrameContent>
      <FrameTemplate
        contents={
          <Monaco
            bus={props.bus}
            enableMultiStatementMode={props.enableMultiStatementMode}
            id={props.frame.id}
            onChange={setText}
            ref={editorRef}
            theme={theme}
            value={text}
          />
        }
        header={props.frame}
        runQuery={() => {
          props.runQuery(text)
        }}
      />
    </ForceFullSizeFrameContent>
  )
}

const mapStateToProps = (state: any) => ({
  browserTheme: getTheme(state),
  drawer: getOpenDrawer(state),
  enableMultiStatementMode: shouldEnableMultiStatementMode(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  runQuery(query: string) {
    dispatch(executeCommand(query, { source: commandSources.playButton }))
  }
})

export default withBus(connect(mapStateToProps, mapDispatchToProps)(EditFrame))
