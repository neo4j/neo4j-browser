import { GraphModel } from '../models/Graph'
import { initD3Layout } from './utils'

class Layout {
  private _graph: GraphModel
  private _screenWidth: number
  private _screenHeight: number
  private _graphWidth: number
  private _graphHeight: number
  private _worldWidth: number
  private _worldHeight: number

  constructor(graph: GraphModel, screenWidth: number, screenHeight: number) {
    this._graph = graph
    this._screenWidth = screenWidth
    this._screenHeight = screenHeight
    this._graphWidth = screenWidth
    this._graphHeight = screenHeight
    this._worldWidth = screenWidth
    this._worldHeight = screenHeight
  }

  initViewportDimension(): {
    graphWidth: number
    graphHeight: number
    worldWidth: number
    worldHeight: number
  } {
    const nodes = this._graph.getNodes()
    const relationships = this._graph.getRelationships()
    initD3Layout(nodes, relationships)

    const { minNodeX, maxNodeX, minNodeY, maxNodeY } = this.getBoundaries()
    this._graphWidth = Math.abs(maxNodeX - minNodeX)
    this._graphHeight = Math.abs(maxNodeY - minNodeY)
    this._worldWidth = Math.max(this._screenWidth * 2, this._graphWidth * 1.2)
    this._worldHeight = Math.max(
      this._screenHeight * 2,
      this._graphHeight * 1.2
    )
    console.log(
      minNodeX,
      maxNodeX,
      minNodeY,
      maxNodeY,
      this._graphWidth,
      this._graphHeight,
      this._worldWidth,
      this._worldHeight
    )

    return {
      graphWidth: this._graphWidth,
      graphHeight: this._graphHeight,
      worldWidth: this._worldWidth,
      worldHeight: this._worldHeight
    }
  }

  getBoundaries(): {
    minNodeX: number
    maxNodeX: number
    minNodeY: number
    maxNodeY: number
  } {
    const nodes = this._graph.getNodes()

    const minNodeX = Math.min(...nodes.map(node => node.x))
    const maxNodeX = Math.max(...nodes.map(node => node.x))
    const minNodeY = Math.min(...nodes.map(node => node.x))
    const maxNodeY = Math.max(...nodes.map(node => node.x))

    return { minNodeX, maxNodeX, minNodeY, maxNodeY }
  }
}

export default Layout
