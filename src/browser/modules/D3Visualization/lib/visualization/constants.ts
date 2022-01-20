import Relationship from './components/Relationship'
import VizNode from './components/VizNode'

export const PRECOMPUTED_TICKS = 300
export const TICKS_PER_RENDER = 10

// Friction.
export const VELOCITY_DECAY = 0.06
// Temperature of the simulation. It's a value in the range [0,1] and it
// decreases over time. Can be seen as the probability that a node will move.
export const DEFAULT_ALPHA = 1
// Temperature the simulation tries to converge to.
export const DEFAULT_ALPHA_TARGET = 0
// Temperature at which the simulation is stopped.
export const DEFAULT_ALPHA_MIN = 0.05
// When dragging we set alphaTarget to a greater value than alphaMin to prevent
// the simulation from stopping.
export const DRAGGING_ALPHA_TARGET = 0.09

export const LINK_DISTANCE = 45

export const FORCE_LINK_DISTANCE = (relationship: Relationship) =>
  relationship.source.radius + relationship.target.radius + LINK_DISTANCE * 2
export const FORCE_COLLIDE_RADIUS = (node: VizNode) => node.radius + 25
export const FORCE_CHARGE = -400
export const FORCE_CENTER_X = 0.03
export const FORCE_CENTER_Y = 0.03
