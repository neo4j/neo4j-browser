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
import d3 from 'd3'
import measureText from '../utils/textMeasurement'

function queryPlan(element) {
  const maxChildOperators = 2 // Fact we know about the cypher compiler
  const maxComparableRows = 1000000 // link widths are comparable between plans if all operators are below this row count
  const maxComparableDbHits = 1000000 // db hits are comparable between plans if all operators are below this db hit count

  const operatorWidth = 220
  const operatorCornerRadius = 4
  const operatorHeaderHeight = 18
  const operatorHeaderFontSize = 11
  const operatorDetailHeight = 14
  const maxCostHeight = 50
  const detailFontSize = 10
  const operatorMargin = 50
  const operatorPadding = 3
  const rankMargin = 50
  const margin = 10
  const standardFont = "'Helvetica Neue',Helvetica,Arial,sans-serif"
  const fixedWidthFont = "'Fira Code',Monaco,'Courier New',Terminal,monospace"
  const linkColor = '#DFE1E3'
  const costColor = '#F25A29'
  const dividerColor = '#DFE1E3'
  const operatorColors = [
    '#c6dbef',
    '#9ecae1',
    '#6baed6',
    '#4292c6',
    '#2171b5',
    '#08519c',
    '#08306b'
  ]

  const operatorCategories = {
    result: ['result'],
    seek: ['scan', 'seek', 'argument'],
    rows: ['limit', 'top', 'skip', 'sort', 'union', 'projection'],
    other: [],
    filter: ['select', 'filter', 'apply', 'distinct'],
    expand: ['expand', 'product', 'join', 'optional', 'path'],
    eager: ['eager']
  }

  const augment = color => ({
    color,
    'border-color': d3.rgb(color).darker(),
    'text-color-internal': d3.hsl(color).l < 0.7 ? '#FFFFFF' : '#000000'
  })

  const colors = d3.scale
    .ordinal()
    .domain(d3.keys(operatorCategories))
    .range(operatorColors)

  const color = function(d) {
    for (const name in operatorCategories) {
      const keywords = operatorCategories[name]
      for (const keyword of Array.from(keywords)) {
        if (new RegExp(keyword, 'i').test(d)) {
          return augment(colors(name))
        }
      }
    }
    return augment(colors('other'))
  }

  const rows = function(operator) {
    let left
    return (left =
      operator.Rows != null ? operator.Rows : operator.EstimatedRows) != null
      ? left
      : 0
  }

  const plural = function(noun, count) {
    if (count === 1) {
      return noun
    } else {
      return `${noun}s`
    }
  }

  const formatNumber = d3.format(',.0f')

  const operatorDetails = function(operator) {
    let expression, identifiers, index, left, left1
    if (!operator.expanded) {
      return []
    }

    const details = []

    const wordWrap = function(string, className) {
      const measure = text => measureText(text, fixedWidthFont, 10)

      const words = string.split(/([^a-zA-Z\d])/)

      let firstWord = 0
      let lastWord = 1
      return (() => {
        const result = []
        while (firstWord < words.length) {
          while (
            lastWord < words.length &&
            measure(words.slice(firstWord, lastWord + 1).join('')) <
              operatorWidth - operatorPadding * 2
          ) {
            lastWord++
          }
          details.push({
            className,
            value: words.slice(firstWord, lastWord).join('')
          })
          firstWord = lastWord
          result.push((lastWord = firstWord + 1))
        }
        return result
      })()
    }

    if (
      (identifiers =
        operator.identifiers != null
          ? operator.identifiers
          : operator.KeyNames != null
          ? operator.KeyNames.split(', ')
          : undefined)
    ) {
      wordWrap(
        identifiers.filter(d => !/^ {2}/.test(d)).join(', '),
        'identifiers'
      )
      details.push({ className: 'padding' })
    }

    if ((index = operator.Index)) {
      wordWrap(index, 'index')
      details.push({ className: 'padding' })
    }

    if (
      (expression =
        (left =
          (left1 =
            operator.Details != null
              ? operator.Details
              : operator.Expressions != null
              ? operator.Expressions
              : operator.Expression != null
              ? operator.Expression
              : operator.LegacyExpression != null
              ? operator.LegacyExpression
              : operator.ExpandExpression) != null
            ? left1
            : operator.LabelName) != null
          ? left
          : operator.Signature)
    ) {
      wordWrap(expression, 'expression')
      details.push({ className: 'padding' })
    }

    if (operator.Order) {
      wordWrap(`Ordered by ${operator.Order}`, 'order')
      details.push({ className: 'padding' })
    }
    if (operator.GlobalMemory) {
      details.push({
        className: 'global-memory',
        key: 'total memory (bytes)',
        value: formatNumber(operator.GlobalMemory)
      })
    }
    if (operator.Memory) {
      details.push({
        className: 'operator-memory',
        key: 'memory (bytes)',
        value: formatNumber(operator.Memory)
      })
    }

    if (operator.PageCacheHits || operator.PageCacheMisses) {
      details.push({
        className: 'pagecache-hits',
        key: 'pagecache hits',
        value: formatNumber(operator.PageCacheHits)
      })
      details.push({
        className: 'pagecache-misses',
        key: 'pagecache misses',
        value: formatNumber(operator.PageCacheMisses)
      })
    }

    if (operator.Rows != null && operator.EstimatedRows != null) {
      details.push({
        className: 'estimated-rows',
        key: 'estimated rows',
        value: formatNumber(operator.EstimatedRows)
      })
    }
    if (operator.DbHits != null && !operator.alwaysShowCost) {
      details.push({
        className: 'db-hits',
        key: plural('db hit', operator.DbHits || 0),
        value: formatNumber(operator.DbHits || 0)
      })
    }

    if (details.length && details[details.length - 1].className === 'padding') {
      details.pop()
    }

    let y = operatorDetailHeight
    for (const detail of Array.from(details)) {
      detail.y = y
      y +=
        detail.className === 'padding'
          ? operatorPadding * 2
          : operatorDetailHeight
    }

    return details
  }

  const transform = function(queryPlan) {
    const operators = []
    const links = []

    const result = {
      operatorType: 'Result',
      children: [queryPlan.root]
    }

    const collectLinks = function(operator, rank) {
      operators.push(operator)
      operator.rank = rank
      return (() => {
        const result1 = []
        for (const child of Array.from(operator.children)) {
          child.parent = operator
          collectLinks(child, rank + 1)
          result1.push(
            links.push({
              source: child,
              target: operator
            })
          )
        }
        return result1
      })()
    }

    collectLinks(result, 0)

    return [operators, links]
  }

  const layout = function(operators, links) {
    const costHeight = (function() {
      const scale = d3.scale
        .log()
        .domain([
          1,
          Math.max(
            d3.max(operators, operator => operator.DbHits || 0),
            maxComparableDbHits
          )
        ])
        .range([0, maxCostHeight])
      return operator =>
        scale((operator.DbHits != null ? operator.DbHits : 0) + 1)
    })()

    const operatorHeight = function(operator) {
      let height = operatorHeaderHeight
      if (operator.expanded) {
        height += operatorDetails(operator).slice(-1)[0].y + operatorPadding * 2
      }
      height += costHeight(operator)
      return height
    }

    const linkWidth = (function() {
      const scale = d3.scale
        .log()
        .domain([
          1,
          Math.max(
            d3.max(operators, operator => rows(operator) + 1),
            maxComparableRows
          )
        ])
        .range([
          2,
          (operatorWidth - operatorCornerRadius * 2) / maxChildOperators
        ])
      return operator => scale(rows(operator) + 1)
    })()

    for (var operator of Array.from(operators)) {
      operator.height = operatorHeight(operator)
      operator.costHeight = costHeight(operator)
      if (operator.costHeight > operatorDetailHeight + operatorPadding) {
        operator.alwaysShowCost = true
      }
      const childrenWidth = d3.sum(operator.children, linkWidth)
      let tx = (operatorWidth - childrenWidth) / 2
      for (const child of Array.from(operator.children)) {
        child.tx = tx
        tx += linkWidth(child)
      }
    }

    for (const link of Array.from(links)) {
      link.width = linkWidth(link.source)
    }

    const ranks = d3
      .nest()
      .key(operator => operator.rank)
      .entries(operators)

    let currentY = 0

    for (var rank of Array.from(ranks)) {
      currentY -= d3.max(rank.values, operatorHeight) + rankMargin
      for (operator of Array.from(rank.values)) {
        operator.x = 0
        operator.y = currentY
      }
    }

    let width = d3.max(
      ranks.map(rank => rank.values.length * (operatorWidth + operatorMargin))
    )
    const height = -currentY

    const collide = () =>
      (() => {
        const result = []
        for (rank of Array.from(ranks)) {
          var dx
          let item
          var x0 = 0
          for (operator of Array.from(rank.values)) {
            dx = x0 - operator.x
            if (dx > 0) {
              operator.x += dx
            }
            x0 = operator.x + operatorWidth + operatorMargin
          }

          dx = x0 - operatorMargin - width
          if (dx > 0) {
            const lastOperator = rank.values[rank.values.length - 1]
            x0 = lastOperator.x -= dx
            item = (() => {
              const result1 = []
              for (let i = rank.values.length - 2; i >= 0; i--) {
                let item1
                operator = rank.values[i]
                dx = operator.x + operatorWidth + operatorMargin - x0
                if (dx > 0) {
                  operator.x -= operatorWidth
                  item1 = x0 = operator.x
                }
                result1.push(item1)
              }
              return result1
            })()
          }
          result.push(item)
        }
        return result
      })()

    const center = operator => operator.x + operatorWidth / 2

    const relaxUpwards = alpha =>
      (() => {
        const result = []
        for (rank of Array.from(ranks)) {
          result.push(
            (() => {
              const result1 = []
              for (operator of Array.from(rank.values)) {
                let item
                if (operator.children.length) {
                  const x =
                    d3.sum(
                      operator.children,
                      child => linkWidth(child) * center(child)
                    ) / d3.sum(operator.children, linkWidth)
                  item = operator.x += (x - center(operator)) * alpha
                }
                result1.push(item)
              }
              return result1
            })()
          )
        }
        return result
      })()

    const relaxDownwards = alpha =>
      (() => {
        const result = []
        for (rank of Array.from(ranks.slice().reverse())) {
          result.push(
            (() => {
              const result1 = []
              for (operator of Array.from(rank.values)) {
                let item
                if (operator.parent) {
                  item = operator.x +=
                    (center(operator.parent) - center(operator)) * alpha
                }
                result1.push(item)
              }
              return result1
            })()
          )
        }
        return result
      })()

    collide()
    let iterations = 300
    let alpha = 1
    while (iterations--) {
      relaxUpwards(alpha)
      collide()
      relaxDownwards(alpha)
      collide()
      alpha *= 0.98
    }

    width =
      d3.max(operators, o => o.x) - d3.min(operators, o => o.x) + operatorWidth

    return [width, height]
  }

  const render = function(operators, links, width, height, redisplay) {
    const svg = d3.select(element)

    svg
      .transition()
      .attr('width', width + margin * 2)
      .attr('height', height + margin * 2)
      .attr(
        'viewBox',
        [
          d3.min(operators, o => o.x) - margin,
          -margin - height,
          width + margin * 2,
          height + margin * 2
        ].join(' ')
      )

    var join = (parent, children) =>
      (() => {
        const result = []
        for (const child of Array.from(d3.entries(children))) {
          let item
          const selection = parent.selectAll(child.key).data(child.value.data)
          child.value.selections(selection.enter(), selection, selection.exit())
          if (child.value.children) {
            item = join(selection, child.value.children)
          }
          result.push(item)
        }
        return result
      })()

    return join(svg, {
      'g.layer.links': {
        data: [links],
        selections(enter) {
          return enter.append('g').attr('class', 'layer links')
        },
        children: {
          '.link': {
            data(d) {
              return d
            },
            selections(enter) {
              return enter.append('g').attr('class', 'link')
            },
            children: {
              path: {
                data(d) {
                  return [d]
                },
                selections(enter, update) {
                  enter.append('path').attr('fill', linkColor)

                  return update.transition().attr('d', d => {
                    const width = Math.max(1, d.width)
                    const sourceX = d.source.x + operatorWidth / 2
                    const targetX = d.target.x + d.source.tx

                    const sourceY = d.source.y + d.source.height
                    const targetY = d.target.y
                    const yi = d3.interpolateNumber(sourceY, targetY)

                    const curvature = 0.5
                    const control1 = yi(curvature)
                    const control2 = yi(1 - curvature)
                    let controlWidth = Math.min(
                      width / Math.PI,
                      (targetY - sourceY) / Math.PI
                    )
                    if (sourceX > targetX + width / 2) {
                      controlWidth *= -1
                    }

                    return [
                      'M',
                      sourceX + width / 2,
                      sourceY,
                      'C',
                      sourceX + width / 2,
                      control1 - controlWidth,
                      targetX + width,
                      control2 - controlWidth,
                      targetX + width,
                      targetY,
                      'L',
                      targetX,
                      targetY,
                      'C',
                      targetX,
                      control2 + controlWidth,
                      sourceX - width / 2,
                      control1 + controlWidth,
                      sourceX - width / 2,
                      sourceY,
                      'Z'
                    ].join(' ')
                  })
                }
              },

              text: {
                data(d) {
                  const x = d.source.x + operatorWidth / 2
                  const y = d.source.y + d.source.height + operatorDetailHeight
                  const { source } = d
                  if (source.Rows != null || source.EstimatedRows != null) {
                    const [key, caption] = Array.from(
                      source.Rows != null
                        ? ['Rows', 'row']
                        : ['EstimatedRows', 'estimated row']
                    )
                    return [
                      {
                        x,
                        y,
                        text: `${formatNumber(source[key])}\u00A0`,
                        anchor: 'end'
                      },
                      {
                        x,
                        y,
                        text: plural(caption, source[key]),
                        anchor: 'start'
                      }
                    ]
                  } else {
                    return []
                  }
                },
                selections(enter, update) {
                  enter
                    .append('text')
                    .attr('font-size', detailFontSize)
                    .attr('font-family', standardFont)

                  return update
                    .transition()
                    .attr('x', d => d.x)
                    .attr('y', d => d.y)
                    .attr('text-anchor', d => d.anchor)
                    .text(d => d.text)
                }
              }
            }
          }
        }
      },

      'g.layer.operators': {
        data: [operators],
        selections(enter) {
          return enter.append('g').attr('class', 'layer operators')
        },
        children: {
          '.operator': {
            data(d) {
              return d
            },
            selections(enter, update) {
              enter.append('g').attr('class', 'operator')

              return update
                .transition()
                .attr('transform', d => `translate(${d.x},${d.y})`)
            },
            children: {
              'rect.background': {
                data(d) {
                  return [d]
                },
                selections(enter, update) {
                  enter.append('rect').attr('class', 'background')

                  return update
                    .transition()
                    .attr('width', operatorWidth)
                    .attr('height', d => d.height)
                    .attr('rx', operatorCornerRadius)
                    .attr('ry', operatorCornerRadius)
                    .attr('fill', 'white')
                    .style('stroke', 'none')
                }
              },

              'g.header': {
                data(d) {
                  return [d]
                },
                selections(enter) {
                  return enter
                    .append('g')
                    .attr('class', 'header')
                    .attr('pointer-events', 'all')
                    .on('click', d => {
                      d.expanded = !d.expanded
                      return redisplay()
                    })
                },
                children: {
                  'path.banner': {
                    data(d) {
                      return [d]
                    },
                    selections(enter, update) {
                      enter.append('path').attr('class', 'banner')

                      return update
                        .attr('d', d => {
                          const shaving =
                            d.height <= operatorHeaderHeight
                              ? operatorCornerRadius
                              : d.height <
                                operatorHeaderHeight + operatorCornerRadius
                              ? operatorCornerRadius -
                                Math.sqrt(
                                  Math.pow(operatorCornerRadius, 2) -
                                    Math.pow(
                                      operatorCornerRadius -
                                        d.height +
                                        operatorHeaderHeight,
                                      2
                                    )
                                )
                              : 0
                          return [
                            'M',
                            operatorWidth - operatorCornerRadius,
                            0,
                            'A',
                            operatorCornerRadius,
                            operatorCornerRadius,
                            0,
                            0,
                            1,
                            operatorWidth,
                            operatorCornerRadius,
                            'L',
                            operatorWidth,
                            operatorHeaderHeight - operatorCornerRadius,
                            'A',
                            operatorCornerRadius,
                            operatorCornerRadius,
                            0,
                            0,
                            1,
                            operatorWidth - shaving,
                            operatorHeaderHeight,
                            'L',
                            shaving,
                            operatorHeaderHeight,
                            'A',
                            operatorCornerRadius,
                            operatorCornerRadius,
                            0,
                            0,
                            1,
                            0,
                            operatorHeaderHeight - operatorCornerRadius,
                            'L',
                            0,
                            operatorCornerRadius,
                            'A',
                            operatorCornerRadius,
                            operatorCornerRadius,
                            0,
                            0,
                            1,
                            operatorCornerRadius,
                            0,
                            'Z'
                          ].join(' ')
                        })
                        .style('fill', d => color(d.operatorType).color)
                    }
                  },

                  'path.expand': {
                    data(d) {
                      if (d.operatorType === 'Result') {
                        return []
                      } else {
                        return [d]
                      }
                    },
                    selections(enter, update) {
                      const rotateForExpand = function(d) {
                        d3.transform()
                        return `translate(${operatorHeaderHeight /
                          2}, ${operatorHeaderHeight / 2}) rotate(${
                          d.expanded ? 90 : 0
                        }) scale(0.5)`
                      }

                      enter
                        .append('path')
                        .attr('class', 'expand')
                        .attr(
                          'fill',
                          d => color(d.operatorType)['text-color-internal']
                        )
                        .attr('d', 'M -5 -10 L 8.66 0 L -5 10 Z')
                        .attr('transform', rotateForExpand)

                      return update
                        .transition()
                        .attrTween('transform', (d, i, a) =>
                          d3.interpolateString(a, rotateForExpand(d))
                        )
                    }
                  },

                  'text.title': {
                    data(d) {
                      return [d]
                    },
                    selections(enter) {
                      return enter
                        .append('text')
                        .attr('class', 'title')
                        .attr('font-size', operatorHeaderFontSize)
                        .attr('font-family', standardFont)
                        .attr('x', operatorHeaderHeight)
                        .attr('y', 13)
                        .attr(
                          'fill',
                          d => color(d.operatorType)['text-color-internal']
                        )
                        .text(d => d.operatorType)
                    }
                  }
                }
              },

              'g.detail': {
                data: operatorDetails,
                selections(enter, update, exit) {
                  enter.append('g')

                  update
                    .attr('class', d => `detail ${d.className}`)
                    .attr(
                      'transform',
                      d => `translate(0, ${operatorHeaderHeight + d.y})`
                    )
                    .attr('font-family', d => {
                      if (
                        d.className === 'expression' ||
                        d.className === 'identifiers'
                      ) {
                        return fixedWidthFont
                      } else {
                        return standardFont
                      }
                    })

                  return exit.remove()
                },
                children: {
                  text: {
                    data(d) {
                      if (d.key) {
                        return [
                          {
                            text: `${d.value}\u00A0`,
                            anchor: 'end',
                            x: operatorWidth / 2
                          },
                          { text: d.key, anchor: 'start', x: operatorWidth / 2 }
                        ]
                      } else {
                        return [
                          { text: d.value, anchor: 'start', x: operatorPadding }
                        ]
                      }
                    },
                    selections(enter, update, exit) {
                      enter.append('text').attr('font-size', detailFontSize)

                      update
                        .attr('x', d => d.x)
                        .attr('text-anchor', d => d.anchor)
                        .attr('fill', 'black')
                        .transition()
                        .each('end', () => update.text(d => d.text))

                      return exit.remove()
                    }
                  },

                  'path.divider': {
                    data(d) {
                      if (d.className === 'padding') {
                        return [d]
                      } else {
                        return []
                      }
                    },
                    selections(enter, update) {
                      enter
                        .append('path')
                        .attr('class', 'divider')
                        .attr('visibility', 'hidden')

                      return update
                        .attr(
                          'd',
                          [
                            'M',
                            0,
                            -operatorPadding * 2,
                            'L',
                            operatorWidth,
                            -operatorPadding * 2
                          ].join(' ')
                        )
                        .attr('stroke', dividerColor)
                        .transition()
                        .each('end', () => update.attr('visibility', 'visible'))
                    }
                  }
                }
              },

              'path.cost': {
                data(d) {
                  return [d]
                },
                selections(enter, update) {
                  enter
                    .append('path')
                    .attr('class', 'cost')
                    .attr('fill', costColor)

                  return update.transition().attr('d', d => {
                    if (d.costHeight < operatorCornerRadius) {
                      const shaving =
                        operatorCornerRadius -
                        Math.sqrt(
                          Math.pow(operatorCornerRadius, 2) -
                            Math.pow(operatorCornerRadius - d.costHeight, 2)
                        )
                      return [
                        'M',
                        operatorWidth - shaving,
                        d.height - d.costHeight,
                        'A',
                        operatorCornerRadius,
                        operatorCornerRadius,
                        0,
                        0,
                        1,
                        operatorWidth - operatorCornerRadius,
                        d.height,
                        'L',
                        operatorCornerRadius,
                        d.height,
                        'A',
                        operatorCornerRadius,
                        operatorCornerRadius,
                        0,
                        0,
                        1,
                        shaving,
                        d.height - d.costHeight,
                        'Z'
                      ].join(' ')
                    } else {
                      return [
                        'M',
                        0,
                        d.height - d.costHeight,
                        'L',
                        operatorWidth,
                        d.height - d.costHeight,
                        'L',
                        operatorWidth,
                        d.height - operatorCornerRadius,
                        'A',
                        operatorCornerRadius,
                        operatorCornerRadius,
                        0,
                        0,
                        1,
                        operatorWidth - operatorCornerRadius,
                        d.height,
                        'L',
                        operatorCornerRadius,
                        d.height,
                        'A',
                        operatorCornerRadius,
                        operatorCornerRadius,
                        0,
                        0,
                        1,
                        0,
                        d.height - operatorCornerRadius,
                        'Z'
                      ].join(' ')
                    }
                  })
                }
              },

              'text.cost': {
                data(d) {
                  if (d.alwaysShowCost) {
                    const y = d.height - d.costHeight + operatorDetailHeight
                    return [
                      {
                        text: `${formatNumber(d.DbHits)}\u00A0`,
                        anchor: 'end',
                        y
                      },
                      { text: 'db hits', anchor: 'start', y }
                    ]
                  } else {
                    return []
                  }
                },
                selections(enter, update) {
                  enter
                    .append('text')
                    .attr('class', 'cost')
                    .attr('font-size', detailFontSize)
                    .attr('font-family', standardFont)
                    .attr('fill', 'white')

                  return update
                    .attr('x', operatorWidth / 2)
                    .attr('text-anchor', d => d.anchor)
                    .transition()
                    .attr('y', d => d.y)
                    .each('end', () => update.text(d => d.text))
                }
              },

              'rect.outline': {
                data(d) {
                  return [d]
                },
                selections(enter, update) {
                  enter.append('rect').attr('class', 'outline')

                  return update
                    .transition()
                    .attr('width', operatorWidth)
                    .attr('height', d => d.height)
                    .attr('rx', operatorCornerRadius)
                    .attr('ry', operatorCornerRadius)
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
                    .style('stroke', d => color(d.operatorType)['border-color'])
                }
              }
            }
          }
        }
      }
    })
  }

  const display = function(queryPlan) {
    const [operators, links] = Array.from(transform(queryPlan))
    const [width, height] = Array.from(layout(operators, links))
    return render(operators, links, width, height, () => display(queryPlan))
  }
  this.display = display
  return this
}

export default queryPlan
