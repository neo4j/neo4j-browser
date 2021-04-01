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
import React, { useEffect } from 'react'
import { withBus } from 'react-suber'
import * as editor from 'shared/modules/editor/editorDuck'
import FrameTemplate from '../Frame/FrameTemplate'
import { UnstyledList, PaddedDiv } from './styled'
import HistoryRow from './HistoryRow'
import { saveAs } from 'file-saver'

export const HistoryFrame = (props: any) => {
  const { frame, bus, setExportItems } = props
  const onHistoryClick = (cmd: any) => {
    bus.send(editor.SET_CONTENT, editor.setContent(cmd))
  }
  useEffect(() => {
    setExportItems([
      {
        name: 'history',
        download: () => {
          const txt = frame.result
            .map((line: string) => {
              const trimmedLine = `${line}`.trim()

              if (trimmedLine.startsWith(':')) {
                return trimmedLine
              }

              return trimmedLine.endsWith(';') ? trimmedLine : `${trimmedLine};`
            })
            .join('\n\n')
          const blob = new Blob([txt], {
            type: 'text/plain;charset=utf-8'
          })

          saveAs(blob, 'history.txt')
        }
      }
    ])
  }, [setExportItems, frame.result])

  const historyRows =
    frame.result.length > 0 ? (
      frame.result.map((entry: any, index: any) => {
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
  return <FrameTemplate contents={<UnstyledList>{historyRows}</UnstyledList>} />
}

export default withBus(HistoryFrame)
