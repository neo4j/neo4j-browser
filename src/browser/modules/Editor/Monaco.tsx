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
import React, { useEffect, useRef } from 'react'

export const VS_LIGHT_THEME = 'vs'
export const VS_DARK_THEME = 'vs-dark'
export const VS_HIGH_CONTRAST_THEME = 'hc-black'

export type VSTheme =
  | typeof VS_LIGHT_THEME
  | typeof VS_DARK_THEME
  | typeof VS_HIGH_CONTRAST_THEME

interface MonacoProps {
  id: string
  value?: string
  onChange?: (value: string) => void
  options?: monaco.editor.IGlobalEditorOptions
  theme?: VSTheme
}

const Monaco = ({
  id,
  value = '',
  onChange = () => undefined,
  theme = VS_LIGHT_THEME
}: MonacoProps): JSX.Element => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoId = `monaco-${id}`

  useEffect(() => {
    editorRef.current = monaco.editor.create(
      document.getElementById(monacoId) as HTMLElement,
      {
        automaticLayout: true,
        contextmenu: false,
        cursorStyle: 'block',
        fontSize: 16,
        lightbulb: { enabled: false },
        links: false,
        minimap: { enabled: false },
        scrollBeyondLastColumn: 0,
        scrollBeyondLastLine: false,
        value: value,
        wordWrap: 'on'
      }
    )

    editorRef.current?.onDidChangeModelContent(() => {
      onChange(editorRef.current?.getValue() || '')
    })

    return () => {
      editorRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    monaco.editor.setTheme(theme)
  }, [theme])

  return (
    <div
      id={monacoId}
      style={{
        overflow: 'hidden',
        width: '100%'
      }}
    />
  )
}

export default Monaco
