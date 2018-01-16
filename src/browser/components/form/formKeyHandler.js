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

export default class FormKeyHandler {
  constructor (submitAction) {
    this.elements = {}
    this.submitAction = submitAction
  }

  initialize (focus = true) {
    focus && this.elements[1] && this.elements[1].focus()
  }

  registerInput (input, position) {
    if (input) {
      this.elements[position] = input
      input.onkeypress = this.handleKeyPress.bind(this)
    }
  }

  registerSubmit (submitAction) {
    this.submitAction = submitAction
  }

  handleKeyPress (e) {
    if (e.keyCode === 13) {
      let currentPosition = null

      for (let key in this.elements) {
        if (this.elements[key] === e.srcElement) {
          currentPosition = key
          break
        }
      }

      if (this.elements[+currentPosition + 1]) {
        this.elements[+currentPosition + 1].focus()
      } else {
        this.submitAction(e)
      }
    }
  }
}
