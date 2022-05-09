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
// d3-color and d3-scale are used only in this file
import { hsl, rgb } from 'd3-color'
import { easeQuadIn } from 'd3-ease'
import { scaleLog, scaleOrdinal } from 'd3-scale'
import { BaseType, Selection, select as d3Select } from 'd3-selection'
import 'd3-transition'

import { measureText } from 'neo4j-arc/graph-visualization'

import { groupBy, max, min, sum } from './arrays'

function queryPlan(this: any, element: any) {
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

  const operatorCategories: { [key: string]: string[] } = {
    result: ['result'],
    seek: ['scan', 'seek', 'argument'],
    rows: ['limit', 'top', 'skip', 'sort', 'union', 'projection'],
    other: [],
    filter: ['select', 'filter', 'apply', 'distinct'],
    expand: ['expand', 'product', 'join', 'optional', 'path'],
    eager: ['eager']
  }

  const augment = (color: any) => ({
    color,
    'border-color': rgb(color).darker(),
    'text-color-internal': hsl(color).l < 0.7 ? '#FFFFFF' : '#000000'
  })

  const colors = scaleOrdinal()
    .domain(Object.keys(operatorCategories))
    .range(operatorColors)

  const color = function (d: any) {
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

  const rows = function (operator: any) {
    let left
    return (left =
      operator.Rows != null ? operator.Rows : operator.EstimatedRows) != null
      ? left
      : 0
  }

  const plural = function (noun: string, count: number) {
    if (count === 1) {
      return noun
    } else {
      return `${noun}s`
    }
  }

  const formatNumber = (n: number) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })

  const operatorDetails = function (operator: any): any {
    let expression, identifiers, index, left, left1
    if (!operator.expanded) {
      return []
    }

    const details: {
      className: string
      value?: string
      key?: string
      y?: number
    }[] = []

    const wordWrap = function (string: string, className: string) {
      const canvas = document.createElement('canvas')
      const canvas2DContext = canvas.getContext('2d')
      const measure = (text: string) =>
        measureText(
          text,
          fixedWidthFont,
          10,
          <CanvasRenderingContext2D>canvas2DContext
        )

      const words = string.split(/([^a-zA-Z\d])/)

      let firstWord = 0
      let lastWord = 1
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
        identifiers.filter((d: any) => !/^ {2}/.test(d)).join(', '),
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

  const transform = function (queryPlan: any) {
    const operators: Array<any> = []
    const links: Array<any> = []

    const result = {
      operatorType: 'Result',
      children: [queryPlan.root]
    }

    const collectLinks = function (operator: any, rank: number) {
      operators.push(operator)
      operator.rank = rank
      for (const child of Array.from(operator.children)) {
        ;(child as any).parent = operator
        collectLinks(child, rank + 1)
        links.push({
          source: child,
          target: operator
        })
      }
    }

    collectLinks(result, 0)

    return [operators, links]
  }

  const layout = function (operators: any[], links: any[]) {
    const costHeight = (function () {
      const scale = scaleLog()
        .domain([
          1,
          Math.max(
            max(operators, (operator: any) => operator.DbHits || 0),
            maxComparableDbHits
          )
        ])
        .range([0, maxCostHeight])
      return (operator: any) =>
        scale((operator.DbHits != null ? operator.DbHits : 0) + 1)
    })()

    const operatorHeight = function (operator: any) {
      let height = operatorHeaderHeight
      if (operator.expanded) {
        height += operatorDetails(operator).slice(-1)[0].y + operatorPadding * 2
      }
      height += costHeight(operator)
      return height
    }

    const linkWidth = (function () {
      const scale = scaleLog()
        .domain([
          1,
          Math.max(
            max(operators, (operator: any) => rows(operator) + 1),
            maxComparableRows
          )
        ])
        .range([
          2,
          (operatorWidth - operatorCornerRadius * 2) / maxChildOperators
        ])
      return (operator: any) => scale(rows(operator) + 1)
    })()

    for (const operator of Array.from(operators)) {
      operator.height = operatorHeight(operator)
      operator.costHeight = costHeight(operator)
      if (operator.costHeight > operatorDetailHeight + operatorPadding) {
        operator.alwaysShowCost = true
      }
      const childrenWidth = sum(operator.children, linkWidth)
      let tx = (operatorWidth - childrenWidth) / 2
      for (const child of Array.from(operator.children)) {
        ;(child as any).tx = tx
        tx += linkWidth(child)
      }
    }

    for (const link of Array.from(links)) {
      link.width = linkWidth(link.source)
    }

    const ranks = groupBy(operators, operator => operator.rank)

    let currentY = 0

    for (const rankValues of Object.values(ranks)) {
      currentY -= max(rankValues, operatorHeight) + rankMargin
      for (const operator of rankValues) {
        operator.x = 0
        operator.y = currentY
      }
    }

    let width = max(
      Object.values(ranks).map(
        rank => rank.length * (operatorWidth + operatorMargin)
      )
    )
    const height = -currentY

    const collide = () => {
      const result = []
      for (const rankValues of Object.values(ranks)) {
        let dx
        let item
        let x0 = 0
        for (const operator of rankValues) {
          dx = x0 - operator.x
          if (dx > 0) {
            operator.x += dx
          }
          x0 = operator.x + operatorWidth + operatorMargin
        }

        dx = x0 - operatorMargin - width
        if (dx > 0) {
          const lastOperator = rankValues[rankValues.length - 1]
          x0 = lastOperator.x -= dx

          const item = []
          for (let i = rankValues.length - 2; i >= 0; i--) {
            let item1
            const operator = rankValues[i]
            dx = operator.x + operatorWidth + operatorMargin - x0
            if (dx > 0) {
              operator.x -= operatorWidth
              item1 = x0 = operator.x
            }
            item.push(item1)
          }
          return item
        }

        result.push(item)
      }
      return result
    }

    const center = (operator: any) => operator.x + operatorWidth / 2

    const relaxUpwards = (alpha: number): void => {
      for (const rankValues of Object.values(ranks)) {
        for (const operator of rankValues) {
          if (operator.children.length) {
            const x =
              sum(
                operator.children,
                (child: any) => linkWidth(child) * center(child)
              ) / sum(operator.children, linkWidth)
            operator.x += (x - center(operator)) * alpha
          }
        }
      }
    }

    const relaxDownwards = (alpha: number): void => {
      for (const rankValues of Object.values(ranks).reverse()) {
        for (const operator of rankValues) {
          if (operator.parent) {
            operator.x += (center(operator.parent) - center(operator)) * alpha
          }
        }
      }
    }

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

    width = max(operators, o => o.x) - min(operators, o => o.x) + operatorWidth

    return [width, height]
  }

  const render = function (
    operators: any,
    links: any,
    width: number,
    height: number,
    redisplay: any
  ) {
    const svg = d3Select(element)
      .transition()
      .attr('width', width + margin * 2)
      .attr('height', height + margin * 2)
      .attr(
        'viewBox',
        [
          min(operators, (o: any): number => o.x) - margin,
          -margin - height,
          width + margin * 2,
          height + margin * 2
        ].join(' ')
      )
      .selection()

    const join = (
      parent: Selection<any, any, any, any>,
      children: any
    ): any[] => {
      const result = []
      for (const child of Object.entries(children)) {
        const [key, value] = child as any

        let item
        let selection = parent.selectAll(key).data(value.data)
        selection = value.selections(selection)
        if (value.children) {
          item = join(selection, value.children)
        }
        result.push(item)
      }
      return result
    }

    return join(svg, {
      'g.layer.links': {
        data: [links],
        selections(selection: Selection<any, any, any, any>) {
          return selection.join('g').attr('class', 'layer links')
        },
        children: {
          '.link': {
            data(d: any) {
              return d
            },
            selections(selection: Selection<any, any, any, any>) {
              return selection.join('g').attr('class', 'link')
            },
            children: {
              path: {
                data(d: any) {
                  return [d]
                },
                selections(selection: Selection<any, any, any, any>) {
                  return selection
                    .join('path')
                    .attr('fill', linkColor)
                    .transition()
                    .attr('d', (d: any) => {
                      const width = Math.max(1, d.width)
                      const sourceX = d.source.x + operatorWidth / 2
                      const targetX = d.target.x + d.source.tx

                      const sourceY = d.source.y + d.source.height
                      const targetY = d.target.y
                      const yi = (n: number) => sourceY * (1 - n) + targetY * n

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
                data(d: any) {
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
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('text')
                    .attr('font-size', detailFontSize)
                    .attr('font-family', standardFont)
                    .attr('fill', 'rgb(107, 174, 214)')
                    .text((d: any) => d.text)
                    .transition()
                    .attr('x', (d: any) => d.x)
                    .attr('y', (d: any) => d.y)
                    .attr('text-anchor', (d: any) => d.anchor)
                }
              }
            }
          }
        }
      },

      'g.layer.operators': {
        data: [operators],
        selections(selection: Selection<BaseType, unknown, BaseType, unknown>) {
          return selection.join('g').attr('class', 'layer operators')
        },
        children: {
          '.operator': {
            data(d: any) {
              return d
            },
            selections(
              selection: Selection<BaseType, unknown, BaseType, unknown>
            ) {
              return selection
                .join('g')
                .attr('class', 'operator')
                .transition()
                .attr('transform', (d: any) => {
                  return `translate(${d.x},${d.y})`
                })
                .selection()
            },
            children: {
              'rect.background': {
                data(d: any) {
                  return [d]
                },
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('rect')
                    .attr('class', 'background')
                    .transition()
                    .attr('width', operatorWidth)
                    .attr('height', (d: any) => d.height)
                    .attr('rx', operatorCornerRadius)
                    .attr('ry', operatorCornerRadius)
                    .attr('fill', 'white')
                    .style('stroke', 'none')
                }
              },

              'g.header': {
                data(d: any) {
                  return [d]
                },
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('g')
                    .attr('class', 'header')
                    .attr('pointer-events', 'all')
                    .on('click', (_e: Event, d: any) => {
                      d.expanded = !d.expanded
                      return redisplay()
                    })
                },
                children: {
                  'path.banner': {
                    data(d: any) {
                      return [d]
                    },
                    selections(
                      selection: Selection<BaseType, unknown, BaseType, unknown>
                    ) {
                      return selection
                        .join('path')
                        .attr('class', 'banner')
                        .attr('d', (d: any) => {
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
                        .style('fill', (d: any) => color(d.operatorType).color)
                    }
                  },

                  'path.expand': {
                    data(d: any) {
                      if (d.operatorType === 'Result') {
                        return []
                      } else {
                        return [d]
                      }
                    },
                    selections(
                      selection: Selection<BaseType, unknown, BaseType, unknown>
                    ) {
                      const rotateForExpand = function (d: any) {
                        return `translate(${operatorHeaderHeight / 2}, ${
                          operatorHeaderHeight / 2
                        }) rotate(${d.expanded ? 90 : 0}) scale(0.5)`
                      }

                      return selection
                        .join('path')
                        .attr('class', 'expand')
                        .attr(
                          'fill',
                          (d: any) =>
                            color(d.operatorType)['text-color-internal']
                        )
                        .attr('d', 'M -5 -10 L 8.66 0 L -5 10 Z')
                        .transition()
                        .ease(easeQuadIn)
                        .duration(200)
                        .attr('transform', rotateForExpand)
                    }
                  },

                  'text.title': {
                    data(d: any) {
                      return [d]
                    },
                    selections(
                      selection: Selection<BaseType, unknown, BaseType, unknown>
                    ) {
                      return selection
                        .join('text')
                        .attr('class', 'title')
                        .attr('font-size', operatorHeaderFontSize)
                        .attr('font-family', standardFont)
                        .attr('x', operatorHeaderHeight)
                        .attr('y', 13)
                        .attr(
                          'fill',
                          (d: any) =>
                            color(d.operatorType)['text-color-internal']
                        )
                        .text((d: any) => d.operatorType)
                    }
                  }
                }
              },

              'g.detail': {
                data: operatorDetails,
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('g')
                    .attr('class', (d: any) => `detail ${d.className}`)
                    .attr(
                      'transform',
                      (d: any) => `translate(0, ${operatorHeaderHeight + d.y})`
                    )
                    .attr('font-family', (d: any) => {
                      if (
                        d.className === 'expression' ||
                        d.className === 'identifiers'
                      ) {
                        return fixedWidthFont
                      } else {
                        return standardFont
                      }
                    })
                },
                children: {
                  text: {
                    data(d: any) {
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
                    selections(
                      selection: Selection<BaseType, unknown, BaseType, unknown>
                    ) {
                      const text = selection
                        .join('text')
                        .attr('font-size', detailFontSize)
                        .attr('x', (d: any) => d.x)
                        .attr('text-anchor', (d: any) => d.anchor)
                        .attr('fill', 'black')

                      return text
                        .transition()
                        .on('end', () => text.text((d: any) => d.text))
                    }
                  },

                  'path.divider': {
                    data(d: any) {
                      if (d.className === 'padding') {
                        return [d]
                      } else {
                        return []
                      }
                    },
                    selections(
                      selection: Selection<BaseType, unknown, BaseType, unknown>
                    ) {
                      const divider = selection
                        .join('path')
                        .attr('class', 'divider')
                        .attr('visibility', 'hidden')
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

                      return divider
                        .transition()
                        .on('end', () => divider.attr('visibility', 'visible'))
                    }
                  }
                }
              },

              'path.cost': {
                data(d: any) {
                  return [d]
                },
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('path')
                    .attr('class', 'cost')
                    .attr('fill', costColor)
                    .transition()
                    .attr('d', (d: any) => {
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
                data(d: any) {
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
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  const text = selection
                    .join('text')
                    .attr('class', 'cost')
                    .attr('font-size', detailFontSize)
                    .attr('font-family', standardFont)
                    .attr('fill', 'white')
                    .attr('x', operatorWidth / 2)
                    .attr('text-anchor', (d: any) => d.anchor)

                  return text
                    .transition()
                    .attr('y', (d: any) => d.y)
                    .on('end', () => text.text((d: any) => d.text))
                }
              },

              'rect.b-outline': {
                data(d: any) {
                  return [d]
                },
                selections(
                  selection: Selection<BaseType, unknown, BaseType, unknown>
                ) {
                  return selection
                    .join('rect')
                    .attr('class', 'b-outline')
                    .attr('width', operatorWidth)
                    .attr('rx', operatorCornerRadius)
                    .attr('ry', operatorCornerRadius)
                    .attr('fill', 'none')
                    .attr('stroke-width', 1)
                    .style(
                      'stroke',
                      // @ts-expect-error
                      (d: any) => color(d.operatorType)['border-color']
                    )
                    .transition()
                    .attr('height', (d: any) => d.height)
                }
              }
            }
          }
        }
      }
    })
  }

  const display = function (queryPlan: any) {
    const [operators, links] = Array.from(transform(queryPlan))
    const [width, height] = Array.from(layout(operators, links))
    return render(operators, links, width, height, () => display(queryPlan))
  }
  this.display = display
  return this
}

export default queryPlan
