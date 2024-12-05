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
import { editor as monacoEditor, KeyCode } from 'monaco-editor'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import type { QueryResult } from 'neo4j-driver'

import {
  ContractIcon,
  ExpandIcon,
  FileIcon,
  RunIcon
} from 'browser-components/icons/LegacyIcons'
import { isMac } from 'neo4j-arc/common'

import {
  CurrentEditIconContainer,
  EditorContainer,
  FlexContainer,
  Header,
  MainEditorWrapper,
  ScriptTitle
} from './styled'
import {
  StyledEditorButton,
  StyledMainEditorButtonsContainer
} from 'browser-components/buttons'

import { MonacoEditor } from 'browser/components/Editor/MonacoEditor'
import { contract, expand } from 'shared/modules/editor/editorDuck'

interface Props {
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  history: string[]
  sendCypherQuery: (text: string) => Promise<QueryResult>
  useDb: string | null
}

const MainEditor: React.FC<Props> = ({
  codeFontLigatures,
  history,
  sendCypherQuery,
}) => {
  const dispatch = useDispatch()
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor>(null)
  const [isFullscreen, setFullscreen] = useState(false)
  const [editorContent, setEditorContent] = useState('')

  const toggleFullscreen = () => {
    setFullscreen(fs => !fs)
    dispatch(isFullscreen ? contract() : expand())
  }

  const onRunClick = () => {
    const content = editorRef.current?.getValue()
    if (content) {
      sendCypherQuery(content)
    }
  }

  const additionalCommands = {
    [KeyCode.Escape]: {
      handler: toggleFullscreen,
      context: '!suggestWidgetVisible && !findWidgetVisible'
    }
  }

  return (
    <MainEditorWrapper isFullscreen={isFullscreen}>
      <Header>
        <FlexContainer>
          <ScriptTitle unsaved={false}>Editor</ScriptTitle>
          <CurrentEditIconContainer>
            <FileIcon width={12} />
          </CurrentEditIconContainer>
        </FlexContainer>
        <StyledMainEditorButtonsContainer>
          <StyledEditorButton
            data-testid="editor-fullscreen"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Contract' : 'Expand'}
          >
            {isFullscreen ? (
              <ContractIcon width={16} />
            ) : (
              <ExpandIcon width={16} />
            )}
          </StyledEditorButton>
          <StyledEditorButton
            data-testid="editor-run"
            onClick={onRunClick}
            title={isMac() ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
          >
            <RunIcon width={16} />
          </StyledEditorButton>
        </StyledMainEditorButtonsContainer>
      </Header>
      <EditorContainer>
        <MonacoEditor
          value={editorContent}
          onChange={setEditorContent}
          onExecute={onRunClick}
          id="main-editor"
          isFullscreen={isFullscreen}
          ref={editorRef}
          additionalCommands={additionalCommands}
          fontLigatures={codeFontLigatures}
          history={history}
        />
      </EditorContainer>
    </MainEditorWrapper>
  )
}

export default MainEditor
