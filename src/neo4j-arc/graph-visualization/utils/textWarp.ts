import { GraphStyleModel } from '../models/GraphStyle'
import { NodeModel } from '../models/Node'
import { measureText } from './textMeasurement'

type NodeCaptionLine = {
  text: string
  baseline: number
  remainingWidth: number
}
export const fitCaptionIntoCircle = (
  node: NodeModel,
  style: GraphStyleModel,
  canvas2DContext: CanvasRenderingContext2D
): NodeCaptionLine[] => {
  const fontFamily = 'sans-serif'
  const fontSize = parseFloat(style.forNode(node).get('font-size'))
  // Roughly calculate max text length the circle can fit by radius and font size
  const maxCaptionTextLength = Math.floor(
    (Math.pow(node.radius, 2) * Math.PI) / Math.pow(fontSize, 2)
  )
  const template = style.forNode(node).get('caption')
  const nodeText = style.interpolate(template, node)
  const captionText =
    nodeText.length > maxCaptionTextLength
      ? nodeText.substring(0, maxCaptionTextLength)
      : nodeText
  const measure = (text: string) =>
    measureText(text, fontFamily, fontSize, canvas2DContext)
  const whiteSpaceMeasureWidth = measure(' ')

  const words = captionText.split(' ')

  const emptyLine = (lineCount: number, lineIndex: number): NodeCaptionLine => {
    // Calculate baseline of the text
    const baseline = (1 + lineIndex - lineCount / 2) * fontSize

    // The furthest distance between chord (top or bottom of the line) and circle centre
    const chordCentreDistance =
      lineIndex < lineCount / 2
        ? baseline - fontSize / 2
        : baseline + fontSize / 2
    const maxLineWidth =
      Math.sqrt(Math.pow(node.radius, 2) - Math.pow(chordCentreDistance, 2)) * 2
    return {
      text: '',
      baseline,
      remainingWidth: maxLineWidth
    }
  }

  const addShortenedNextWord = (
    line: NodeCaptionLine,
    word: string
  ): string => {
    while (word.length > 2) {
      const newWord = `${word.substring(0, word.length - 2)}\u2026`
      if (measure(newWord) < line.remainingWidth) {
        return `${line.text.split(' ').slice(0, -1).join(' ')} ${newWord}`
      }
      word = word.substring(0, word.length - 1)
    }
    return `${word}\u2026`
  }

  const fitOnFixedNumberOfLines = function (
    lineCount: number
  ): [NodeCaptionLine[], number] {
    const lines = []
    const wordMeasureWidthList: number[] = words.map((word: string) =>
      measure(`${word}`)
    )
    let wordIndex = 0
    for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
      const line = emptyLine(lineCount, lineIndex)
      while (
        wordIndex < words.length &&
        wordMeasureWidthList[wordIndex] <
          line.remainingWidth - whiteSpaceMeasureWidth
      ) {
        line.text = `${line.text} ${words[wordIndex]}`
        line.remainingWidth -=
          wordMeasureWidthList[wordIndex] + whiteSpaceMeasureWidth
        wordIndex++
      }
      lines.push(line)
    }
    if (wordIndex < words.length) {
      lines[lineCount - 1].text = addShortenedNextWord(
        lines[lineCount - 1],
        words[wordIndex]
      )
    }
    return [lines, wordIndex]
  }

  let consumedWords = 0
  const maxLines = (node.radius * 2) / fontSize

  let lines = [emptyLine(1, 0)]
  // Typesetting for finding suitable lines to fit words
  for (let lineCount = 1; lineCount <= maxLines; lineCount++) {
    const [candidateLines, candidateWords] = fitOnFixedNumberOfLines(lineCount)

    // If the lines don't have empty line(s), they're probably good fit for the typesetting
    if (!candidateLines.some((line: NodeCaptionLine) => !line.text)) {
      lines = candidateLines
      consumedWords = candidateWords
    }
    if (consumedWords >= words.length) {
      return lines
    }
  }
  return lines
}
