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
import { useSpring, animated } from 'react-spring'
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
import {
  EXPAND,
  SET_CONTENT,
  CARDSIZE,
  EDIT_CONTENT
} from 'shared/modules/editor/editorDuck'
import { FrameButton } from 'browser-components/buttons'
import {
  ExpandIcon,
  ContractIcon,
  CloseIcon,
  UpIcon,
  DownIcon
} from 'browser-components/icons/Icons'
import {
  SELECT_PROJECT_FILE,
  ProjectFile,
  PROJECT_FILE_ERROR,
  EDIT_PROJECT_FILE_START,
  EDIT_PROJECT_FILE_END,
  REMOVE_PROJECT_FILE
} from 'browser/modules/Sidebar/project-files.constants'
import { COMMAND_QUEUED } from 'shared/modules/commands/commandsDuck'

type EditorSize = 'CARD' | 'LINE' | 'FULLSCREEN'
type EditorFrameProps = { bus: Bus }
type CodeEditor = {
  getValue: () => string | null
  setValue: (newText: string) => void
}

type ActiveRelateFile = Omit<ProjectFile, 'downloadToken'>

export function EditorFrame({ bus }: EditorFrameProps): JSX.Element {
  const [sizeState, setSize] = useState<EditorSize>('LINE')
  const [
    activeProjectFile,
    setActiveProjectFile
  ] = useState<ActiveRelateFile | null>(null)
  const [activeProjectFileStatus, setActiveProjectFileStatus] = useState<
    string | null
  >(null)
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
  useEffect(() => {
    let isStillMounted = true
    // when a saved Project Script or Local Cache Script is clicked
    // not sure at this point which it could be
    bus &&
      bus.take(EDIT_CONTENT, () => {
        if (isStillMounted) {
          setActiveProjectFile(null)
          setActiveProjectFileStatus(null)
        }
      })
    // only when a Project Script is clicked
    bus &&
      bus.take(SELECT_PROJECT_FILE, projectFile => {
        if (isStillMounted) {
          setActiveProjectFile(projectFile)
          setActiveProjectFileStatus(null)
        }
      })
    // when a non-Project File action sets content in the editor
    bus &&
      bus.take(SET_CONTENT, () => {
        if (isStillMounted) {
          setActiveProjectFile(null)
          setActiveProjectFileStatus(null)
        }
      })
    // start of Project File edit (ProjectFileButton)
    bus &&
      bus.take(EDIT_PROJECT_FILE_START, () => {
        if (isStillMounted) {
          setActiveProjectFileStatus('saving edit...')
        }
      })
    // successful completion of Project File edit (ProjectFilesButton)
    bus &&
      bus.take(EDIT_PROJECT_FILE_END, () => {
        if (isStillMounted) {
          setActiveProjectFileStatus(null)
        }
      })
    // Edit error (ProjectFilesButton)
    bus &&
      bus.take(PROJECT_FILE_ERROR, () => {
        if (isStillMounted) {
          setActiveProjectFileStatus('error saving...')
        }
      })
    // On Execute command, clear the heading
    bus &&
      bus.take(COMMAND_QUEUED, () => {
        if (isStillMounted) {
          setActiveProjectFile(null)
          setActiveProjectFileStatus(null)
        }
      })

    return () => {
      isStillMounted = false
    }
  }, [bus])

  useEffect(() => {
    let isStillMounted = true
    // clear editor if active Relate file is deleted from sidebar
    bus &&
      bus.take(REMOVE_PROJECT_FILE, (removedProjectFile: ActiveRelateFile) => {
        if (isStillMounted) {
          if (
            activeProjectFile &&
            removedProjectFile.directory === activeProjectFile.directory &&
            removedProjectFile.name === activeProjectFile.name
          ) {
            bus.send(SET_CONTENT, { message: '' })
          }
        }
      })

    return () => {
      isStillMounted = false
    }
  }, [bus, activeProjectFile])

  function discardEditor() {
    sizeState !== 'LINE' && setSize('LINE')
    bus && bus.send(SET_CONTENT, { message: '' })

    setAnimation({
      from: stable,
      //  @ts-expect-error, library typings are wrong....
      to: [end, start, stable],
      config
    })
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

  const start = {
    width: '100%',
    position: 'absolute',
    opacity: 0,
    top: -100,
    left: '0vw'
  }
  const stable = {
    width: '100%',
    position: 'absolute',
    opacity: 1,
    top: 10,
    left: '0vw'
  }
  const end = {
    width: '100%',
    position: 'absolute',
    opacity: 0,
    left: '-100vw',
    top: 10
  }

  const config = { mass: 1, tension: 180, friction: 24, clamp: true }

  const TypedEditor: any = Editor // delete this when editor is ts
  const [props, setAnimation] = useSpring(() => ({
    to: stable,
    config
  }))

  const activeProjectFileName = activeProjectFile && activeProjectFile.name
  const activeProjectFileHeading =
    activeProjectFileName &&
    `${activeProjectFileName}${
      activeProjectFileStatus ? ` - ${activeProjectFileStatus}` : ''
    }`

  return (
    <AnimationContainer cardSize={isCardSize}>
      <animated.div
        className="springContainer"
        style={props}
        data-testid="activeEditor"
      >
        <Frame fullscreen={isFullscreen}>
          <FrameHeader>
            <FrameHeaderText>{activeProjectFileHeading}</FrameHeaderText>
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
    </AnimationContainer>
  )
}

export default withBus(EditorFrame)
