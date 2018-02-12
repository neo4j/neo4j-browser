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
import Renderer from '../components/renderer'
const noop = function () {}

const duck = require("shared/modules/settings/settingsDuck");
const store = require("browser/AppInit");

const nodeRingStrokeSize = 8

const nodeOutline = new Renderer({
  onGraphChange (selection, viz) {
    const circles = selection.selectAll('circle.outline').data(node => [node])

    circles
      .enter()
      .append('circle')
      .classed('outline', true)
      .attr({
        cx: 0,
        cy: 0
      })

    circles.attr({
      r (node) {
        return node.radius
      },
      fill (node) {
        return viz.style.forNode(node).get('color')
      },
      stroke (node) {
        return viz.style.forNode(node).get('border-color')
      },
      'stroke-width' (node) {
        return viz.style.forNode(node).get('border-width')
      }
    })

    return circles.exit().remove()
  },
  onTick: noop
})

const nodeCaption = new Renderer({
  onGraphChange (selection, viz) {
    const text = selection.selectAll('text.caption').data(node => node.caption)

    text
      .enter()
      .append('text')
      // .classed('caption', true)
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    text
      .text(line => line.text)
      .attr('y', line => line.baseline)
      .attr('font-size', line => viz.style.forNode(line.node).get('font-size'))
      .attr({
        fill (line) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })
      .attr({
        'style'(line) {
          const shadowColor = viz.style.forNode(line.node).get('shadow-color');
          if (shadowColor !== '') {
            return 'text-shadow:' +
            '-1px 1px 2px ' + shadowColor +
            ', -1px -1px 2px ' + shadowColor +
            ', 1px 1px 2px ' + shadowColor +
            ', 1px -1px 2px ' + shadowColor;
          } else {
            return '';
          }
        }
      });

    return text.exit().remove()
  },

  onTick: noop
})

const nodeIcon = new Renderer({
  onGraphChange (selection, viz) {
    const text = selection.selectAll('text').data(node => node.caption)

    text
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })
      .attr({ 'font-family': 'streamline' })

    text
      .text(line => viz.style.forNode(line.node).get('icon-code'))
      .attr('dy', line => line.node.radius / 16)
      .attr('font-size', line => line.node.radius)
      .attr({
        fill (line) {
          return viz.style.forNode(line.node).get('text-color-internal')
        }
      })

    return text.exit().remove()
  },

  onTick: noop
})

const nodeImage = new Renderer({
  onGraphChange(selection, viz) {
    if (!duck.getSettings(store.store.getState()).showThumbnail) {
      return;
    }
    const thumbnailAttr = duck.getSettings(store.store.getState()).thumbnailAttribute;
    const pattern = selection.selectAll('pattern').data(function(node) {
      if (node.propertyMap[thumbnailAttr]) { return [node]; } else { return []; }
    });

    pattern.enter()
    .append('pattern')
    .attr({
      id(id) { return `img-fill-${id.id}`; },
      patternUnits: 'userSpaceOnUse',
      x(node) { return -(node.radius); },
      y(node) { return -(node.radius); },
      width(node) { return (node.radius * 2); },
      height(node) { return (node.radius * 2); }}).append('image')
    .attr("xlink:href", link => link.propertyMap[thumbnailAttr])
    .attr({
      type: 'image/png',
      x: 0,
      y: 0,
      width(node) { return (node.radius * 2); },
      height(node) { return (node.radius * 2); },
      opacity: duck.getSettings(store.store.getState()).thumbnailOpacity
    });

    return pattern.exit().remove();
  },

  onTick: noop
})

const nodeImageFill = new Renderer({
  onGraphChange(selection, viz) {
    const filledCircle = selection.selectAll('circle.filled').data(node => [node]);

    filledCircle.enter()
    .append('circle')
    .classed('filled', true)
    .attr({
      cx: 0,
      cy: 0,
      r(node) { return node.radius-1; },
      fill(id) { return `url(#img-fill-${id.id})`; }
    });

    return filledCircle.exit().remove();
  },

  onTick: noop
})

const nodeRing = new Renderer({
  onGraphChange (selection) {
    const circles = selection.selectAll('circle.ring').data(node => [node])
    circles
      .enter()
      .insert('circle', '.outline')
      .classed('ring', true)
      .attr({
        cx: 0,
        cy: 0,
        'stroke-width': nodeRingStrokeSize + 'px'
      })

    circles.attr({
      r (node) {
        return node.radius + 4
      }
    })

    return circles.exit().remove()
  },

  onTick: noop
})

const arrowPath = new Renderer({
  name: 'arrowPath',
  onGraphChange (selection, viz) {
    const paths = selection.selectAll('path.outline').data(rel => [rel])

    paths
      .enter()
      .append('path')
      .classed('outline', true)

    paths
      .attr('fill', rel => viz.style.forRelationship(rel).get('color'))
      .attr('stroke', rel => viz.style.forRelationship(rel).get('border-color'))

    return paths.exit().remove()
  },

  onTick (selection) {
    return selection
      .selectAll('path')
      .attr('d', d => d.arrow.outline(d.shortCaptionLength))
  }
})

const relationshipType = new Renderer({
  name: 'relationshipType',
  onGraphChange (selection, viz) {
    const texts = selection.selectAll('text').data(rel => [rel])

    texts
      .enter()
      .append('text')
      .attr({ 'text-anchor': 'middle' })
      .attr({ 'pointer-events': 'none' })

    texts
      .attr('font-size', rel => viz.style.forRelationship(rel).get('font-size'))
      .attr('fill', rel =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )

    return texts.exit().remove()
  },

  onTick (selection, viz) {
    return selection
      .selectAll('text')
      .attr('x', rel => rel.arrow.midShaftPoint.x)
      .attr(
        'y',
        rel =>
          rel.arrow.midShaftPoint.y +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', function (rel) {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel.arrow.midShaftPoint.x} ${
            rel.arrow.midShaftPoint.y
          })`
        } else {
          return null
        }
      })
      .text(rel => rel.shortCaption)
  }
})

const relationshipOverlay = new Renderer({
  name: 'relationshipOverlay',
  onGraphChange (selection) {
    const rects = selection.selectAll('path.overlay').data(rel => [rel])

    rects
      .enter()
      .append('path')
      .classed('overlay', true)

    return rects.exit().remove()
  },

  onTick (selection) {
    const band = 16

    return selection
      .selectAll('path.overlay')
      .attr('d', d => d.arrow.overlay(band))
  }
})

const node = []
node.push(nodeOutline)
node.push(nodeIcon)
node.push(nodeCaption)
node.push(nodeRing)
node.push(nodeImage)
node.push(nodeImageFill)

const relationship = []
relationship.push(arrowPath)
relationship.push(relationshipType)
relationship.push(relationshipOverlay)

export { node, relationship }
