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

import React, { useState, useEffect } from 'react'
import { withBus } from 'react-suber'
import { Bus } from 'suber'
import Editor from './Editor'
import { Frame, FrameHeader, FrameHeaderText, UIControls } from './styled'
import {
  EDIT_CONTENT,
  SET_CONTENT,
  GET_CONTENT,
  EXPAND
} from 'shared/modules/editor/editorDuck'
import { FrameButton } from 'browser-components/buttons'
import {
  ExpandIcon,
  ContractIcon,
  CloseIcon,
  UpIcon,
  DownIcon
} from 'browser-components/icons/Icons'

type EditorSize = 'CARD' | 'LINE' | 'FULLSCREEN'
type EditorFrameProps = { bus: Bus }

export function EditorFrame({ bus }: EditorFrameProps) {
  const [sizeState, setSize] = useState<EditorSize>('LINE')
  const isFullscreen = sizeState === 'FULLSCREEN'
  const isCardSize = sizeState === 'CARD'

  function toggleFullscreen() {
    if (isFullscreen) {
      bus.self(GET_CONTENT, {}, ({ message }) => {
        const editorLines = message.split('\n').length
        if (editorLines > 1) {
          setSize('CARD')
        } else {
          setSize('LINE')
        }
      })
    } else {
      setSize('FULLSCREEN')
    }
  }

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen))

  function toggleCardView() {
    if (isCardSize) {
      bus.self(GET_CONTENT, {}, ({ message, id }) => {
        const editorLines = message.split('\n').length
        if (editorLines > 1) {
          bus.send(EDIT_CONTENT, {
            message: message
              .split('\n')
              .filter((nonEmpty: string) => nonEmpty)
              .join(' '),
            id
          })
        }
        setSize('LINE')
      })
    } else {
      setSize('CARD')
    }
  }

  function discardEditor() {
    bus.send(SET_CONTENT, { message: '' })
    sizeState !== 'LINE' && setSize('LINE')
  }

  const buttons = [
    {
      onClick: toggleFullscreen,
      title: isFullscreen ? 'Close fullscreen' : 'Fullscreen',
      icon: isFullscreen ? <ContractIcon /> : <ExpandIcon />,
      testId: 'fullscreen'
    },
    {
      onClick: toggleCardView,
      title: isCardSize ? 'Collapse' : 'Expand',
      icon: isCardSize ? <UpIcon /> : <DownIcon />,
      testId: 'cardSize'
    },
    {
      onClick: discardEditor,
      title: 'Discard',
      icon: <CloseIcon />,
      testId: 'discard'
    }
  ]

  return (
    <Frame fullscreen={isFullscreen}>
      <FrameHeader>
        <FrameHeaderText> </FrameHeaderText>
        <UIControls>
          {buttons.map(({ onClick, icon, title, testId }) => (
            <FrameButton
              key={`frame-${title}`}
              title={title}
              onClick={onClick}
              data-testid={`editor-${testId}`}
            >
              {icon}
            </FrameButton>
          ))}
        </UIControls>
      </FrameHeader>
      {
        // @ts-expect-error, until editor uses ts
        <Editor editorSize={sizeState} setSize={setSize} />
      }
    </Frame>
  )
}

export default withBus(EditorFrame)
