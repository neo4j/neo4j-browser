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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { withTheme } from 'styled-components'
import { getHistory } from 'shared/modules/history/historyDuck'
import { shouldEditorLint } from 'shared/modules/settings/settingsDuck'
import { deepEquals } from 'services/utils'
import Codemirror from './Codemirror'
import * as schemaConvert from './editorSchemaConverter'
import cypherFunctions from './cypher/functions'

type EditorState = any

export class Editor extends Component<any, EditorState> {
  codeMirror: any
  editor: any
  constructor(props: any) {
    super(props)
    this.state = {
      historyIndex: -1,
      buffer: '',
      notifications: [],
      lastPosition: { line: 0, column: 0 }
    }
  }

  shouldComponentUpdate(nextProps: any) {
    return !deepEquals(nextProps.schema, this.props.schema)
  }

  triggerAutocompletion = (cm: any, changed: any) => {
    if (
      !changed ||
      !changed.text ||
      changed.text.length !== 1 ||
      !this.props.enableEditorAutocomplete
    ) {
      return
    }

    const text = changed.text[0]
    const triggerAutocompletion =
      text === '.' ||
      text === ':' ||
      text === '[]' ||
      text === '()' ||
      text === '{}' ||
      text === '[' ||
      text === '(' ||
      text === '{'
    if (triggerAutocompletion) {
      try {
        cm.execCommand('autocomplete')
      } catch (e) {}
    }
  }

  componentDidMount() {
    this.loadCodeMirror()
  }

  loadCodeMirror = () => {
    if (this.codeMirror) {
      return
    }
    if (!this.editor) {
      setTimeout(() => this.loadCodeMirror(), 200)
      return
    }
    this.codeMirror = this.editor.getCodeMirror()
    this.codeMirror.on('change', (cm: any, changed: any) => {
      try {
        this.triggerAutocompletion(cm, changed)
      } catch (e) {
        console.log(e)
      }
    })
    if (this.props.editorRef) {
      this.props.editorRef.current = this.codeMirror
    }
  }

  render() {
    const options = {
      autofocus: true,
      smartIndent: false,
      lint: this.props.enableEditorLint,
      hintOptions: {
        completeSingle: false,
        closeOnUnfocus: false,
        alignWithWord: true,
        async: true
      },
      autoCloseBrackets: {
        explode: ''
      }
    }

    return (
      <Codemirror
        ref={ref => {
          this.editor = ref
        }}
        options={options}
        schema={this.props.schema}
        initialPosition={this.state.lastPosition}
      />
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    enableEditorLint: shouldEditorLint(state),
    history: getHistory(state),
    schema: {
      parameters: Object.keys(state.params),
      labels: state.meta.labels.map(schemaConvert.toLabel),
      relationshipTypes: state.meta.relationshipTypes.map(
        schemaConvert.toRelationshipType
      ),
      propertyKeys: state.meta.properties.map(schemaConvert.toPropertyKey),
      functions: [
        ...cypherFunctions,
        ...state.meta.functions.map(schemaConvert.toFunction)
      ],
      procedures: state.meta.procedures.map(schemaConvert.toProcedure)
    }
  }
}

export default withTheme(withBus(connect(mapStateToProps)(Editor)))
