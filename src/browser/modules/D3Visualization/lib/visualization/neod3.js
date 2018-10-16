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
/* global d3, DOMParser */

window.neo = window.neo || {}

neo.models = {}

d3.selection.enter.prototype.appendSVG = function (SVGString) {
  return this.select(function () {
    return this.appendChild(
      document.importNode(
        new DOMParser().parseFromString(SVGString, 'application/xml')
          .documentElement.firstChild,
        true
      )
    )
  })
}

neo.renderers = {
  menu: [],
  node: [],
  relationship: []
}

neo.utils = {
  // Note: quick n' dirty. Only works for serializable objects
  copy (src) {
    return JSON.parse(JSON.stringify(src))
  },

  extend (dest, src) {
    if (!neo.utils.isObject(dest) && neo.utils.isObject(src)) {
      return
    }
    for (let k of Object.keys(src || {})) {
      const v = src[k]
      dest[k] = v
    }
    return dest
  },

  isArray:
    Array.isArray ||
    (obj => Object.prototype.toString.call(obj) === '[object Array]'),

  isObject (obj) {
    return Object(obj) === obj
  }
}
