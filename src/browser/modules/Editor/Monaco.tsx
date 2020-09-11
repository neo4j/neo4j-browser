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
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react'

export interface monacoHandles {
  getValue: () => string
  setValue: (value: string) => void
  dispose: () => void
}

const Monaco = forwardRef<monacoHandles, any>(
  (_props, ref): JSX.Element => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

    useEffect(() => {
      editorRef.current = monaco.editor.create(
        document.getElementById('mon-editor') as HTMLElement,
        { automaticLayout: true }
      )

      editorRef.current.onDidChangeModelContent(() => {
        console.log(editorRef.current?.getValue())
      })

      return () => {
        editorRef.current?.dispose()
      }
    }, [])

    useImperativeHandle(ref, () => ({
      getValue() {
        return editorRef.current?.getValue() || ''
      },
      setValue(value) {
        editorRef.current?.setValue(value)
      },
      dispose() {
        editorRef.current?.dispose()
      }
    }))

    return <div id="mon-editor" style={{ height: 'auto', width: '100%' }} />
  }
)

export default Monaco
