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

import * as monaco from 'monaco-editor'
import React, { useEffect, useState, useRef } from 'react'

const Monaco: React.FC = () => {
  const editorRef = (useRef(null) as unknown) as React.MutableRefObject<
    monaco.editor.IStandaloneCodeEditor
  >
  const [text, setText] = useState('')
  console.log(text)

  useEffect(() => {
    editorRef.current = monaco.editor.create(
      document.getElementById('mon-editor') as HTMLElement
    )

    editorRef.current.onDidChangeModelContent(() => {
      setText(editorRef.current.getValue())
      console.log(editorRef.current.getValue())
    })

    // todo dispose of editor
  }, [])
  return (
    <>
      <div id="mon-editor" style={{ height: '700px', width: '500px' }} />
    </>
  )
}

export default Monaco
