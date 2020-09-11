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

import React, { Dispatch, useRef } from 'react'
import { connect } from 'react-redux'
import { Action } from 'redux'
import Monaco, { monacoHandles } from '../Editor/Monaco'
import FrameTemplate from '../Frame/FrameTemplate'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { Frame } from 'shared/modules/stream/streamDuck'

interface EditFrameProps {
  frame: Frame
  runQuery: (query: string) => void
}

const EditFrame = ({ frame, runQuery }: EditFrameProps): JSX.Element => {
  const monaco = useRef<monacoHandles>(null)

  return (
    <FrameTemplate
      contents={<Monaco ref={monaco}></Monaco>}
      header={frame}
      runQuery={() => {
        const value = monaco.current?.getValue() || ''
        runQuery(value)
      }}
    />
  )
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  runQuery: (query: string) => {
    dispatch(executeCommand(query))
    // todo update query and cmd in store.frames?
  }
})

export default connect(null, mapDispatchToProps)(EditFrame)
