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
import * as editor from 'shared/modules/editor/editorDuck'
import FrameTemplate from '../Frame/FrameTemplate'
import { UnstyledList, PaddedDiv } from './styled'
import HistoryRow from './HistoryRow'

export const HistoryFrame = props => {
  const { frame, bus } = props
  const onHistoryClick = cmd => {
    bus.send(editor.SET_CONTENT, editor.setContent(cmd))
  }
  const historyRows =
    frame.result.length > 0 ? (
      frame.result.map((entry, index) => {
        return (
          <HistoryRow
            key={index}
            handleEntryClick={onHistoryClick}
            entry={entry}
          />
        )
      })
    ) : (
      <PaddedDiv>
        <em>Empty history</em>
      </PaddedDiv>
    )
  return (
    <FrameTemplate
      header={frame}
      contents={<UnstyledList>{historyRows}</UnstyledList>}
    />
  )
}

export default withBus(HistoryFrame)
