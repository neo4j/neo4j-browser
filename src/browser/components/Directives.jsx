/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { executeCommand } from 'shared/modules/commands/commandsDuck'
import { addClass, prependIcon } from 'shared/services/dom-helpers'

const directives = [{
  selector: '[exec-topic]',
  valueExtractor: (elem) => {
    return `:${elem.getAttribute('exec-topic')}`
  }
}, {
  selector: '[play-topic]',
  valueExtractor: (elem) => {
    return `:play ${elem.getAttribute('play-topic')}`
  }
}, {
  selector: '[server-topic]',
  valueExtractor: (elem) => {
    return `:server ${elem.getAttribute('server-topic')}`
  }
}, {
  selector: '[help-topic]',
  valueExtractor: (elem) => {
    return `:help ${elem.getAttribute('help-topic')}`
  }
}, {
  selector: '.runnable pre',
  valueExtractor: (elem) => {
    return elem.textContent.trim()
  }
}, {
  selector: 'pre.runnable',
  valueExtractor: (elem) => {
    return elem.textContent.trim()
  }
}]

const prependHelpIcon = (element) => {
  prependIcon(element, 'fa fa-question-circle-o')
}

const prependPlayIcon = (element) => {
  prependIcon(element, 'fa fa-play-circle-o')
}

export const Directives = (props) => {
  const callback = (elem) => {
    if (elem) {
      directives.forEach((directive) => {
        const elems = elem.querySelectorAll(directive.selector)
        Array.from(elems).forEach((e) => {
          if (e.firstChild.nodeName !== 'I') {
            directive.selector === '[help-topic]' ? prependHelpIcon(e) : prependPlayIcon(e)
          }

          e.onclick = () => {
            addClass(e, 'clicked')
            return props.onItemClick(directive.valueExtractor(e))
          }
        })
      })
    }
  }
  return (
    <div ref={callback}>
      {props.content}
    </div>
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd) => {
      if (!cmd.endsWith(' null') && !cmd.endsWith(':null')) {
        const action = executeCommand(cmd)
        ownProps.bus.send(action.type, action)
      }
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(Directives))
