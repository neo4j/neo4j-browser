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

import React, { Dispatch, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action } from 'redux'
import styled from 'styled-components'
import { Bus } from 'suber'

import Monaco from '../Editor/Monaco'
import FrameTemplate from '../Frame/FrameTemplate'
import { StyledFrameBody, StyledFrameContents } from '../Frame/styled'
import { GlobalState } from 'shared/globalState'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { Frame } from 'shared/modules/stream/streamDuck'

interface EditFrameProps {
  bus: Bus
  codeFontLigatures: boolean
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

  return (
    <ForceFullSizeFrameContent>
      <FrameTemplate
        contents={
          <Monaco
            bus={props.bus}
            enableMultiStatementMode={props.enableMultiStatementMode}
            fontLigatures={props.codeFontLigatures}
            id={props.frame.id}
            onChange={setText}
            value={text}
            toggleFullscreen={() => {
              /* don't allow fullscreening */
            }}
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

const mapStateToProps = (state: GlobalState) => ({
  enableMultiStatementMode: shouldEnableMultiStatementMode(state),
  codeFontLigatures: codeFontLigatures(state)
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  runQuery(query: string) {
    dispatch(executeCommand(query, { source: commandSources.playButton }))
  }
})

export default withBus(connect(mapStateToProps, mapDispatchToProps)(EditFrame))
