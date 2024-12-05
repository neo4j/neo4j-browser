import { editor, KeyMod, KeyCode } from 'monaco-editor'
import React, { useEffect, useRef } from 'react'

export interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: (value: string) => void
  fontLigatures?: boolean
  history?: string[]
  id: string
  isFullscreen?: boolean
  additionalCommands?: Record<string, any>
  className?: string
}

export const MonacoEditor = React.forwardRef<editor.IStandaloneCodeEditor, MonacoEditorProps>(
  ({ value, onChange, onExecute, id, additionalCommands = {} }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<editor.IStandaloneCodeEditor>()

    useEffect(() => {
      if (!containerRef.current) return

      editorRef.current = editor.create(containerRef.current, {
        value,
        language: 'cypher',
        minimap: { enabled: false },
        automaticLayout: true,
        contextmenu: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on'
      })

      // Forward the ref
      if (typeof ref === 'function') {
        ref(editorRef.current)
      } else if (ref) {
        ref.current = editorRef.current
      }

      // Set up change handler
      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current?.getValue() || '')
      })

      // Set up execute command
      editorRef.current.addCommand(
        KeyMod.CtrlCmd | KeyCode.Enter,
        () => onExecute(editorRef.current?.getValue() || '')
      )

      // Add additional commands
      Object.entries(additionalCommands).forEach(([key, command]) => {
        editorRef.current?.addCommand(Number(key), command.handler, command.context)
      })

      // ... rest of component
    }, [additionalCommands])

    return <div ref={containerRef} data-testid={id} className="h-full" />
  }
) 