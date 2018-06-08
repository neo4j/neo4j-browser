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

import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import FrameTemplate from './FrameTemplate'
import { StyledHistoryList } from './styled'
import HistoryRow from './HistoryRow'

export const HistoryFrame = props => {
  const { frame, bus } = props
  const onHistoryClick = cmd => {
    bus.send(editor.SET_CONTENT, editor.setContent(cmd))
  }
  const historyRows = frame.result.map((entry, index) => {
    return (
      <HistoryRow key={index} handleEntryClick={onHistoryClick} entry={entry} />
    )
  })
  return (
    <FrameTemplate
      header={frame}
      contents={<StyledHistoryList>{historyRows}</StyledHistoryList>}
    />
  )
}

export default withBus(HistoryFrame)
