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
import { isNullish } from '../utils/arrays'
import Graph from './Graph'
import { MeasureSizeFn, Visualization } from './Visualization'
import GraphStyle from 'project-root/src/browser/modules/D3Visualization/graphStyle'

export default class GraphView {
  callbacks: Record<string, undefined | Array<(...args: any[]) => void>>
  graph: Graph
  style: GraphStyle
  viz: Visualization

  constructor(
    element: any,
    measureSize: MeasureSizeFn,
    graph: Graph,
    style: GraphStyle
  ) {
    this.graph = graph
    this.style = style
    this.callbacks = {}

    this.viz = new Visualization(
      element,
      measureSize,
      this.graph,
      this.style,
      (event: any, ...args: any[]) =>
        (this.callbacks[event] || []).forEach((callback: any) =>
          callback.apply(null, args)
        )
    )
  }

  on(event: any, callback: any) {
    if (isNullish(this.callbacks[event])) {
      this.callbacks[event] = []
    }

    this.callbacks[event]?.push(callback)
    return this
  }

  layout(value: any) {
    if (!arguments.length) {
      return this.layout
    }
    this.layout = value
    return this
  }

  grass(value: string): void {
    if (!arguments.length) {
      return this.style.toSheet()
    }
    this.style.importGrass(value)
  }

  init(): void {
    this.viz.init()
  }

  update(options: {
    updateNodes: boolean
    updateRelationships: boolean
    restartSimulation?: boolean
  }): void {
    this.viz.update({
      ...options,
      restartSimulation: options.restartSimulation ?? true
    })
  }

  resize(): void {
    this.viz.resize()
  }

  boundingBox() {
    return this.viz.boundingBox()
  }

  zoomIn() {
    return this.viz.zoomInClick()
  }

  zoomOut() {
    return this.viz.zoomOutClick()
  }
}
