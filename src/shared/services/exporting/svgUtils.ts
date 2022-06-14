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
import { select as d3Select } from 'd3-selection'

export const prepareForExport = (
  svgElement: SVGElement,
  graphElement: any,
  type: any
) => {
  const dimensions = getSvgDimensions(graphElement)
  let svg = d3Select(
    document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  )

  svg.append('title').text('Neo4j Graph Visualization')
  svg.append('desc').text('Created using Neo4j (http://www.neo4j.com/)')

  switch (type) {
    case 'plan': {
      svg = appendPlanLayers(svgElement, svg)
      break
    }
    case 'graph':
    default:
      svg = appendGraphLayers(svgElement, svg)
  }

  svg.selectAll('.overlay, .ring').remove()
  svg.selectAll('.context-menu-item').remove()
  svg
    .selectAll('text')
    .attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')

  svg.attr('width', dimensions.width)
  svg.attr('height', dimensions.height)
  svg.attr('viewBox', dimensions.viewBox)

  return svg
}

const getSvgDimensions = (view: any) => {
  const boundingBox = view.boundingBox()
  const dimensions = {
    width: boundingBox.width,
    height: boundingBox.height,
    viewBox: [
      boundingBox.x,
      boundingBox.y,
      boundingBox.width,
      boundingBox.height
    ].join(' ')
  }
  return dimensions
}

const appendGraphLayers = (svgElement: SVGElement, svg: any) => {
  d3Select(svgElement)
    .selectAll('g.layer')
    .each(function () {
      svg.node().appendChild(
        d3Select<SVGGElement, unknown>(this as SVGGElement)
          .node()
          ?.cloneNode(true)
      )
    })
  return svg
}
const appendPlanLayers = (svgElement: SVGElement, svg: any) => {
  d3Select(svgElement)
    .selectAll('g.layer')
    .each(function () {
      svg.node().appendChild(
        d3Select<SVGGElement, unknown>(this as SVGGElement)
          .node()
          ?.cloneNode(true)
      )
    })
  return svg
}
