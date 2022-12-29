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
import { NodeModel } from './models/Node'
import { RelationshipModel } from './models/Relationship'

export const MAX_PRECOMPUTED_TICKS = 300
export const EXTRA_TICKS_PER_RENDER = 10

// Friction.
export const VELOCITY_DECAY = 0.4
// Temperature of the simulation. It's a value in the range [0,1] and it
// decreases over time. Can be seen as the probability that a node will move.
export const DEFAULT_ALPHA = 1
// Temperature the simulation tries to converge to.
export const DEFAULT_ALPHA_TARGET = 0
// Temperature at which the simulation is stopped.
export const DEFAULT_ALPHA_MIN = 0.05
// The lower this value, the lower the movement of nodes that aren't being
// dragged. This also affects the perceived elasticity of relationships, a lower
// value will cause neighboring nodes to take more time to follow the node that
// is being dragged.
export const DRAGGING_ALPHA = 0.8
// When dragging we set alphaTarget to a value greater than alphaMin to prevent
// the simulation from stopping.
export const DRAGGING_ALPHA_TARGET = 0.09

export const LINK_DISTANCE = 45

export const FORCE_LINK_DISTANCE = (relationship: RelationshipModel): number =>
  relationship.source.radius + relationship.target.radius + LINK_DISTANCE * 2
export const FORCE_COLLIDE_RADIUS = (node: NodeModel): number =>
  node.radius + 25
export const FORCE_CHARGE = -400
export const FORCE_CENTER_X = 0.03
export const FORCE_CENTER_Y = 0.03

export const ZOOM_MIN_SCALE = 0.1
export const ZOOM_MAX_SCALE = 2
export const ZOOM_FIT_PADDING_PERCENT = 0.05
