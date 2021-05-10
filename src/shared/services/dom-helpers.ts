/*
 * Copyright (c) "Neo4j"
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

const addClass = (node: any, className: any) => {
  if (!(node instanceof HTMLElement && typeof className === 'string')) {
    return
  }

  // normalize node class name
  const nodeClassName = ` ${node.className} `
  if (nodeClassName.indexOf(` ${className} `) === -1) {
    node.className += (node.className ? ' ' : '') + className
  }
}

const prependIcon = (element: any, classname: string, onClick: () => void) => {
  const icon = document.createElement('i')
  addClass(icon, classname)
  icon.setAttribute('style', 'padding-right:4px')
  element.insertBefore(icon, element.firstChild)

  if (onClick) {
    icon.onclick = e => {
      // prevent populating the editor as well
      e.stopPropagation()
      onClick()
    }
  }
}

export { addClass, prependIcon }
