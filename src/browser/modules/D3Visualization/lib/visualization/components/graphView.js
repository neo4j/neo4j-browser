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
import viz from './visualization'
import layout from './layout'

export default class graphView {
  constructor(element, measureSize, graph, style) {
    this.graph = graph
    this.style = style
    const forceLayout = layout.force()
    this.viz = viz(element, measureSize, this.graph, forceLayout, this.style)
    this.callbacks = {}
    const { callbacks } = this
    this.viz.trigger = (() => (event, ...args) =>
      Array.from(callbacks[event] || []).map(callback =>
        callback.apply(null, args)
      ))()
  }

  on(event, callback) {
    ;(this.callbacks[event] != null
      ? this.callbacks[event]
      : (this.callbacks[event] = [])
    ).push(callback)
    return this
  }

  layout(value) {
    if (!arguments.length) {
      return this.layout
    }
    this.layout = value
    return this
  }

  grass(value) {
    if (!arguments.length) {
      return this.style.toSheet()
    }
    this.style.importGrass(value)
    return this
  }

  update() {
    this.viz.update()
    return this
  }

  resize() {
    this.viz.resize()
    return this
  }

  boundingBox() {
    return this.viz.boundingBox()
  }

  collectStats() {
    return this.viz.collectStats()
  }

  zoomIn(elem) {
    return this.viz.zoomInClick(elem)
  }

  zoomOut(elem) {
    return this.viz.zoomOutClick(elem)
  }
}
