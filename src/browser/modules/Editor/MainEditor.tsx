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
import { CypherEditor, type CypherEditor as CypherEditorType } from 'neo4j-arc/cypher-language-support'
import { QueryResult } from 'neo4j-driver'
import React, { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { KeyCode } from 'monaco-editor'

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

import * as editor from 'shared/modules/editor/editorDuck'

interface Props {
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  history: string[]
  sendCypherQuery: (text: string) => Promise<QueryResult>
  useDb: string | null
}

const MainEditor: React.FC<Props> = ({
  codeFontLigatures,
  enableMultiStatementMode,
  history,
  sendCypherQuery,
  useDb
}) => {
  const dispatch = useDispatch()
  const editorRef = useRef<CypherEditorType>(null)
  const [isFullscreen, setFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setFullscreen(fs => !fs)
    dispatch(isFullscreen ? editor.contract() : editor.expand())
  }

  const onRunClick = () => {
    const content = editorRef.current?.getValue()
    if (content) {
      sendCypherQuery(content)
    }
  }

  const onChange = () => {
    // Handle editor content changes
  }

  const onDisplayHelpKeys = () => {
    // Handle help keys display
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
        <CypherEditor
          enableMultiStatementMode={enableMultiStatementMode}
          fontLigatures={codeFontLigatures}
          history={history}
          id={'main-editor'}
          isFullscreen={isFullscreen}
          onChange={onChange}
          onDisplayHelpKeys={onDisplayHelpKeys}
          onExecute={onRunClick}
          ref={editorRef}
          additionalCommands={additionalCommands}
          useDb={useDb}
          sendCypherQuery={sendCypherQuery}
        />
      </EditorContainer>
    </MainEditorWrapper>
  )
}

export default MainEditor
