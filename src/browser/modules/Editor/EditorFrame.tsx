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

import React, { useState, useEffect, useRef } from 'react'
import { useTransition, animated } from 'react-spring'
import { withBus } from 'react-suber'
import { Bus } from 'suber'
import Editor from './Editor'
import {
  printShortcut,
  FULLSCREEN_SHORTCUT,
  CARDSIZE_SHORTCUT
} from 'browser/modules/App/keyboardShortcuts'
import {
  Frame,
  FrameHeader,
  FrameHeaderText,
  UIControls,
  AnimationContainer
} from './styled'
import { EXPAND, CARDSIZE } from 'shared/modules/editor/editorDuck'
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
type CodeEditor = {
  getValue: () => string | null
  setValue: (newText: string) => void
}

export function EditorFrame({ bus }: EditorFrameProps): JSX.Element {
  const [showEditor, setShowEditor] = useState(true)
  const [sizeState, setSize] = useState<EditorSize>('LINE')
  const isFullscreen = sizeState === 'FULLSCREEN'
  const isCardSize = sizeState === 'CARD'
  const editorRef = useRef<CodeEditor>(null)

  function toggleFullscreen() {
    const editorVal = (editorRef.current && editorRef.current.getValue()) || ''
    const lineCount = editorVal.split('\n').length
    if (isFullscreen) {
      if (lineCount > 1) {
        setSize('CARD')
      } else {
        setSize('LINE')
      }
    } else {
      setSize('FULLSCREEN')
    }
  }

  function toggleCardView() {
    const editorVal = (editorRef.current && editorRef.current.getValue()) || ''
    const lineCount = editorVal.split('\n').length

    if (isCardSize) {
      if (lineCount > 1) {
        editorRef.current &&
          editorRef.current.setValue(
            editorVal
              .split('\n')
              .filter((nonEmpty: string) => nonEmpty)
              .join(' ')
          )
      }
      setSize('LINE')
    } else {
      setSize('CARD')
    }
  }

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen))
  useEffect(() => bus && bus.take(CARDSIZE, toggleCardView))

  function discardEditor() {
    editorRef.current && editorRef.current.setValue('')
    sizeState !== 'LINE' && setSize('LINE')
    setShowEditor(false)
  }

  const buttons = [
    {
      onClick: toggleFullscreen,
      title: `${
        isFullscreen ? 'Close fullscreen ' : 'Fullscreen'
      } (${printShortcut(FULLSCREEN_SHORTCUT)})`,
      icon: isFullscreen ? <ContractIcon /> : <ExpandIcon />,
      testId: 'fullscreen'
    },
    {
      onClick: toggleCardView,
      title: `${isCardSize ? 'Collapse' : 'Expand'} (${printShortcut(
        CARDSIZE_SHORTCUT
      )})`,
      icon: isCardSize ? <UpIcon /> : <DownIcon />,
      testId: 'cardSize'
    },
    {
      onClick: discardEditor,
      title: 'Close',
      icon: <CloseIcon />,
      testId: 'discard'
    }
  ]

  const TypedEditor: any = Editor // delete this when editor is ts
  const standardStyle = {
    width: '100%',
    marginLeft: 0,
    marginTop: 0,
    opacity: 1
  }
  const transitions = useTransition(showEditor, null, {
    from: { ...standardStyle, opacity: 0.5 },
    enter: { ...standardStyle, opacity: 1 },
    leave: { ...standardStyle, opacity: 0, marginLeft: -500 },
    onDestroyed: () => setShowEditor(true)
  })

  return (
    <AnimationContainer>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div className="springContainer" key={key} style={props}>
              <Frame fullscreen={isFullscreen}>
                <FrameHeader>
                  <FrameHeaderText />
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
                <TypedEditor
                  editorSize={sizeState}
                  setSize={setSize}
                  editorRef={editorRef}
                />
              </Frame>
            </animated.div>
          )
      )}
    </AnimationContainer>
  )
}

export default withBus(EditorFrame)
