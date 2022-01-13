import { ArcArrow } from 'neo4j-arc/graph-visualization/utils/ArcArrow'
import { LoopArrow } from 'neo4j-arc/graph-visualization/utils/LoopArrow'
import { StraightArrow } from 'neo4j-arc/graph-visualization/utils/StraightArrow'
import { SimulationLinkDatum } from 'd3-force'
import VItem from './VItem'
import VNode from './VNode'

type RelationShipCaptionLayout = 'internal' | 'external'

class VRelationship extends VItem implements SimulationLinkDatum<VNode> {
  source: VNode
  target: VNode
  type: string
  internal: boolean

  naturalAngle: number
  caption: string
  captionLength: number
  captionHeight: number
  captionLayout: RelationShipCaptionLayout
  shortCaption: string | undefined
  shortCaptionLength: number | undefined
  centreDistance: number
  arrow: ArcArrow | LoopArrow | StraightArrow | undefined

  constructor(
    id: string,
    source: VNode,
    target: VNode,
    type: string,
    properties: Record<string, string>,
    propertyTypes: Record<string, string>
  ) {
    super(id, properties, propertyTypes, false)

    this.source = source
    this.target = target
    this.type = type
    this.internal = false

    // These values are overriden as part of the initial layouting of the graph
    this.naturalAngle = 0
    this.caption = ''
    this.captionLength = 0
    this.captionHeight = 0
    this.captionLayout = 'internal'
    this.centreDistance = 0
  }

  isLoop(): boolean {
    return this.source === this.target
  }
}

export default VRelationship
