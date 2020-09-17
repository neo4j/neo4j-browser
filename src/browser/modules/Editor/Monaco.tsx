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
import { Theme } from '../Stream/EditFrame'

export interface MonacoHandles {
  getValue: () => string
  setValue: (value: string) => void
  setOptions: (options: monaco.editor.IGlobalEditorOptions) => void
  setTheme: (theme: string) => void
}

interface MonacoProps {
  id: string
  theme: Theme
}

const Monaco = forwardRef<MonacoHandles, MonacoProps>(
  (props: MonacoProps, ref): JSX.Element => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const id = `monaco-${props.id}`

    useEffect(() => {
      editorRef.current = monaco.editor.create(
        document.getElementById(id) as HTMLElement,
        { automaticLayout: true }
      )

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
      setOptions(options) {
        editorRef.current?.updateOptions(options)
      },
      setTheme(theme) {
        monaco.editor.setTheme(theme)
      }
    }))

    return <div id={id} style={{ height: 'auto', width: '100%' }} />
  }
)

export default Monaco
