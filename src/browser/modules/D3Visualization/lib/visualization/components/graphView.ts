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
import viz from './visualization'
import layout from './layout'

export default class graphView {
  callbacks: any
  graph: any
  style: any
  viz: any
  constructor(element: any, graph: any, style: any) {
    this.graph = graph
    this.style = style
    const forceLayout = layout.force()
    this.viz = viz(element, this.graph, forceLayout, this.style)
    this.callbacks = {}
    const { callbacks } = this
    this.viz.trigger = (() => (event: any, ...args: any[]) =>
      Array.from(callbacks[event] || []).map((callback: any) =>
        callback.apply(null, args)
      ))()
  }

  on(event: any, callback: any) {
    ;(this.callbacks[event] != null
      ? this.callbacks[event]
      : (this.callbacks[event] = [])
    ).push(callback)
    return this
  }

  layout(value: any) {
    if (!arguments.length) {
      return this.layout
    }
    this.layout = value
    return this
  }

  grass(value: any) {
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

  boundingBox() {
    return this.viz.boundingBox()
  }

  collectStats() {
    return this.viz.collectStats()
  }

  zoomIn(elem: any) {
    return this.viz.zoomInClick(elem)
  }

  zoomOut(elem: any) {
    return this.viz.zoomOutClick(elem)
  }
}
