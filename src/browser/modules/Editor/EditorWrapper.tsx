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
import { SET_CONTENT, EXPAND } from 'shared/modules/editor/editorDuck'
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
    isFullscreen ? setSize('LINE') : setSize('FULLSCREEN')
  }

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen))

  function toggleCardView() {
    isCardSize ? setSize('LINE') : setSize('CARD')
  }

  function clearEditor() {
    bus.send(SET_CONTENT, { message: '' })
  }

  const fullscreenIcon = isFullscreen ? <ContractIcon /> : <ExpandIcon />
  const expandCollapseIcon = isCardSize ? <UpIcon /> : <DownIcon />

  const buttons = [
    {
      onClick: toggleFullscreen,
      disabled: false,
      title: 'Fullscreen',
      Icon: fullscreenIcon
    },
    {
      onClick: toggleCardView,
      disabled: false,
      title: isCardSize ? 'Collapse' : 'Cardview',
      Icon: expandCollapseIcon
    },
    {
      onClick: clearEditor,
      disabled: false,
      title: 'Clear',
      Icon: CloseIcon
    }
  ]

  return (
    <Frame>
      <FrameHeader>
        <FrameHeaderText> </FrameHeaderText>
        <UIControls>
          <FrameButton
            title={isFullscreen ? 'Close fullscreen' : 'Fullscreen'}
            onClick={onClick}
          >
            <fullscreenIcon />
          </FrameButton>
          <FrameButton
            title={isCardSize ? 'Expand' : 'Collapse'}
            onClick={onClick}
          >
            <CloseIcon />
          </FrameButton>
          <FrameButton title={'Reset editor'} onClick={clearEditor}>
            <CloseIcon />
          </FrameButton>
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
