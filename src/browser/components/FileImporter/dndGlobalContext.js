/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { DragDropManager } from 'dnd-core'
import HTML5Backend from 'react-dnd-html5-backend'
import { Component } from 'preact'

let defaultManager

/**
 * This is singleton used to initialize only once dnd in our app.
 * If you initialized dnd and then try to initialize another dnd
 * context the app will break.
 * Here is more info: https://github.com/gaearon/react-dnd/issues/186
 *
 * The solution is to call Dnd context from this singleton this way
 * all dnd contexts in the app are the same.
 */
const getDndContext = () => {
  if (defaultManager) return defaultManager
  defaultManager = new DragDropManager(HTML5Backend)

  return defaultManager
}

class DndContextWrapping extends Component {
  getChildContext () {
    return {
      dragDropManager: getDndContext()
    }
  }
  render () {
    let childProps = { ...this.props }
    delete childProps.Component
    return <this.props.Component {...childProps} />
  }
}

export const wrapWithDndContext = Component => {
  return props => {
    return <DndContextWrapping {...props} Component={Component} />
  }
}
