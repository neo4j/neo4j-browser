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
import PairwiseArcsRelationshipRouting from '../utils/pairwiseArcsRelationshipRouting'
import measureText from '../utils/textMeasurement'
import {
  allLabelPositions,
  ICaptionSettings,
  LabelPosition
} from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelModal'
import { flatten, floor } from 'lodash-es'
import { includePropertyNameKey } from 'project-root/src/browser/modules/D3Visualization/components/modal/label/SetupLabelDisplaySettings'

export default class NeoD3Geometry {
  relationshipRouting: any
  style: any

  constructor(style: any) {
    this.style = style
    this.relationshipRouting = new PairwiseArcsRelationshipRouting(this.style)
  }

  formatNodeCaptions(nodes: any[]) {
    return Array.from(nodes).map(
      node => (node.caption = fitCaptionIntoCircle(node, this.style))
    )
  }

  formatRelationshipCaptions(relationships: any[]) {
    return (() => {
      const result = []
      for (const relationship of Array.from(relationships)) {
        const template = this.style.forRelationship(relationship).get('caption')
        result.push(
          (relationship.caption = this.style.interpolate(
            template,
            relationship
          ))
        )
      }
      return result
    })()
  }

  setNodeRadii(nodes: any[]) {
    return Array.from(nodes).map(
      node =>
        (node.radius = parseFloat(this.style.forNode(node).get('diameter')) / 2)
    )
  }

  onGraphChange(graph: any) {
    this.setNodeRadii(graph.nodes())
    this.formatNodeCaptions(graph.nodes())
    this.formatRelationshipCaptions(graph.relationships())
    return this.relationshipRouting.measureRelationshipCaptions(
      graph.relationships()
    )
  }

  onTick(graph: any) {
    return this.relationshipRouting.layoutRelationships(graph)
  }
}

const square = (distance: any) => distance * distance
const addShortenedNextWord = (line: any, word: any, measure: any) => {
  const result = []
  while (!(word.length <= 2)) {
    word = `${word.substr(0, word.length - 2)}\u2026`
    if (measure(word) < line.remainingWidth) {
      line.text += ` ${word}`
      break
    } else {
      result.push(undefined)
    }
  }
  return result
}
const noEmptyLines = function(lines: any[]) {
  for (const line of Array.from(lines)) {
    if (line.text.length === 0) {
      return false
    }
  }
  return true
}
const emptyLine = ({
  lineCount,
  iLine,
  style,
  node,
  lineHeight,
  fontWeight,
  fontStyle,
  textDecoration
}: {
  lineCount: number
  style: any
  node: any
  iLine: number
  lineHeight: number
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
}) => {
  let baseline = (1 + iLine - lineCount / 2) * lineHeight
  if (style.forNode(node).get('icon-code')) {
    baseline = baseline + node.radius / 3
  }
  const containingHeight =
    iLine < lineCount / 2 ? baseline - lineHeight : baseline
  const lineWidth =
    Math.sqrt(square(node.radius) - square(containingHeight)) * 2
  return {
    node,
    text: '',
    baseline,
    remainingWidth: lineWidth,
    fontWeight,
    fontStyle,
    textDecoration
  }
}

interface IWordObject {
  word: string
  belongsTo: number
  fontWeight: string
  fontStyle: string
  textDecoration: string
}

const fitMultipleCaptionsIntoCircle = function(
  node: any,
  style: any,
  captionSettings: ICaptionSettings
) {
  const fontSize = parseFloat(style.forNode(node).get('font-size'))
  const maxLines = (node.radius * 2) / fontSize
  const wordsObjects: IWordObject[] = flatten(
    allLabelPositions.map((position, index) => {
      const currentStyle = captionSettings[position]
      if (currentStyle.caption) {
        const nodeText: string = style.interpolate(currentStyle.caption, node)
        const captionText: string =
          nodeText.length > 100 ? nodeText.substring(0, 100) : nodeText
        const fontWeight =
          currentStyle['font-weight'] ?? style.forNode(node).get('font-weight')
        const fontStyle =
          currentStyle['font-style'] ?? style.forNode(node).get('font-style')
        const textDecoration =
          currentStyle['text-decoration'] ??
          style.forNode(node).get('text-decoration')
        const words: string[] = captionText.split(' ')
        if (currentStyle[includePropertyNameKey]) {
          words.unshift(`${currentStyle.caption.replace(/[{}]/g, '')}:`)
        }
        return words.map(word => ({
          word,
          belongsTo: index,
          fontWeight,
          fontStyle,
          textDecoration
        }))
      }
      return []
    })
  )

  const fontFamily = 'sans-serif'
  const lineHeight = fontSize

  const fitMultipleOnFixedNumberOfLines = ({
    lineCount,
    words
  }: {
    lineCount: any
    words: IWordObject[]
  }): [any, number] => {
    const measure = (text: string) => measureText(text, fontFamily, fontSize)

    const lines = []
    let iWord = 0
    for (
      let iLine = 0, end = lineCount - 1, asc = end >= 0;
      asc ? iLine <= end : iLine >= end;
      asc ? iLine++ : iLine--
    ) {
      const line = emptyLine({ lineCount, iLine, node, lineHeight, style })
      const currentWord = words[iWord]
      let currentCaptionIndex: number | undefined
      if (currentWord) {
        currentCaptionIndex = currentWord.belongsTo
        line.fontWeight = currentWord.fontWeight
        line.fontStyle = currentWord.fontStyle
        line.textDecoration = currentWord.textDecoration
      }
      while (
        iWord < words.length &&
        measure(` ${words[iWord].word}`) < line.remainingWidth &&
        currentCaptionIndex === words[iWord].belongsTo
      ) {
        line.text += ` ${words[iWord].word}`
        line.remainingWidth -= measure(` ${words[iWord].word}`)
        iWord++
      }
      lines.push(line)
    }
    if (iWord < words.length) {
      addShortenedNextWord(lines[lineCount - 1], words[iWord].word, measure)
    }
    return [lines, iWord]
  }

  let lines = [emptyLine({ lineCount: 1, iLine: 0, lineHeight, style, node })]
  let consumedWords = 0
  for (
    let lineCount = 1, end = maxLines, asc = end >= 1;
    asc ? lineCount <= end : lineCount >= end;
    asc ? lineCount++ : lineCount--
  ) {
    const [candidateLines, candidateWords] = Array.from(
      fitMultipleOnFixedNumberOfLines({
        lineCount,
        words: wordsObjects
      })
    )
    if (noEmptyLines(candidateLines)) {
      ;[lines, consumedWords] = Array.from([candidateLines, candidateWords])
    }
    if (consumedWords >= wordsObjects.length) {
      return lines
    }
  }
  return lines
}
const fitCaptionIntoCircle = function(node: any, style: any) {
  const captionSettingsInput = style.forNode(node).get('captionSettings')
  const captionSettings: ICaptionSettings | null =
    captionSettingsInput === '' ? null : captionSettingsInput
  if (captionSettings) {
    return fitMultipleCaptionsIntoCircle(node, style, captionSettings)
  }
  const template = style.forNode(node).get('caption')
  const nodeText = style.interpolate(template, node)
  const captionText =
    nodeText.length > 100 ? nodeText.substring(0, 100) : nodeText
  const fontFamily = 'sans-serif'
  const fontSize = parseFloat(style.forNode(node).get('font-size'))
  const maxLines = (node.radius * 2) / fontSize
  const lineHeight = fontSize
  const words = captionText.split(' ')

  const fitOnFixedNumberOfLines = function({
    lineCount,
    words
  }: {
    lineCount: any
    words: string[]
  }): [any, number] {
    const measure = (text: any) => measureText(text, fontFamily, fontSize)

    const lines = []
    let iWord = 0
    for (
      let iLine = 0, end = lineCount - 1, asc = end >= 0;
      asc ? iLine <= end : iLine >= end;
      asc ? iLine++ : iLine--
    ) {
      const line = emptyLine({ lineCount, iLine, node, lineHeight, style })
      while (
        iWord < words.length &&
        measure(` ${words[iWord]}`) < line.remainingWidth
      ) {
        line.text += ` ${words[iWord]}`
        line.remainingWidth -= measure(` ${words[iWord]}`)
        iWord++
      }
      lines.push(line)
    }
    if (iWord < words.length) {
      addShortenedNextWord(lines[lineCount - 1], words[iWord], measure)
    }
    return [lines, iWord]
  }
  let consumedWords = 0

  let lines = [emptyLine({ lineCount: 1, iLine: 0, lineHeight, style, node })]
  for (
    let lineCount = 1, end = maxLines, asc = end >= 1;
    asc ? lineCount <= end : lineCount >= end;
    asc ? lineCount++ : lineCount--
  ) {
    const [candidateLines, candidateWords] = Array.from(
      fitOnFixedNumberOfLines({
        lineCount,
        words
      })
    )
    if (noEmptyLines(candidateLines)) {
      ;[lines, consumedWords] = Array.from([candidateLines, candidateWords])
    }
    if (consumedWords >= words.length) {
      return lines
    }
  }
  return lines
}
