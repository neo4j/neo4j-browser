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
import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import * as editor from 'shared/modules/editor/editorDuck'
import { addClass, prependIcon } from 'shared/services/dom-helpers'

const directives = [
  {
    selector: '[exec-topic]',
    valueExtractor: elem => {
      return `:${elem.getAttribute('exec-topic')}`
    },
    autoExec: true
  },
  {
    selector: '[play-topic]',
    valueExtractor: elem => {
      return `:play ${elem.getAttribute('play-topic')}`
    },
    autoExec: true
  },
  {
    selector: '[server-topic]',
    valueExtractor: elem => {
      return `:server ${elem.getAttribute('server-topic')}`
    },
    autoExec: true
  },
  {
    selector: '[help-topic]',
    valueExtractor: elem => {
      return `:help ${elem.getAttribute('help-topic')}`
    },
    autoExec: true
  },
  {
    selector: '.runnable pre',
    valueExtractor: elem => {
      return elem.textContent.trim()
    },
    autoExec: false
  },
  {
    selector: 'pre.runnable',
    valueExtractor: elem => {
      return elem.textContent.trim()
    },
    autoExec: false
  }
]

const prependPlayIcon = element => {
  prependIcon(element, 'fa fa-play-circle-o')
}

const bindDynamicInputToDom = element => {
  const valueForElems = element.querySelectorAll('[value-for]')
  const valueKeyElems = element.querySelectorAll('[value-key]')
  if (valueForElems.length > 0 && valueKeyElems.length > 0) {
    valueForElems.forEach(valueForElem => {
      const newArray = [...valueKeyElems]
      const filteredValueKeyElems = newArray.filter(e => {
        return (
          e.getAttribute('value-key') === valueForElem.getAttribute('value-for')
        )
      })
      if (filteredValueKeyElems.length > 0) {
        valueForElem.onkeyup = event => {
          filteredValueKeyElems.forEach(elm => {
            elm.innerText = event.target.value
          })
        }
      }
    })
  }
}

export const Directives = props => {
  const callback = elem => {
    if (elem) {
      directives.forEach(directive => {
        const elems = elem.querySelectorAll(directive.selector)
        Array.from(elems).forEach(e => {
          if (e.firstChild.nodeName !== 'I') {
            prependPlayIcon(e)
          }

          e.onclick = () => {
            addClass(e, 'clicked')
            return props.onItemClick(
              directive.valueExtractor(e),
              directive.autoExec,
              props.originFrameId
            )
          }
        })
      })
      bindDynamicInputToDom(elem)
    }
  }
  return <div ref={callback}>{props.content}</div>
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd, autoExec, id) => {
      if (!cmd.endsWith(' null') && !cmd.endsWith(':null')) {
        if (autoExec) {
          const action = executeCommand(cmd, { id })
          ownProps.bus.send(action.type, action)
        } else {
          ownProps.bus.send(editor.SET_CONTENT, editor.setContent(cmd))
        }
      }
    }
  }
}

export default withBus(
  connect(
    null,
    mapDispatchToProps
  )(Directives)
)
