import { colourToNumber } from '../../utils/colour'
import { Container, Graphics, Text } from 'pixi.js'

import { ARROW_NAME, CAPTION_NAME } from '../../constants'
import { arcToCurve, svgPathParser } from '../../utils/svgPathResolver'

class RelationshipRenderer {
  _resolution: number
  constructor(resolution: number) {
    this._resolution = resolution
  }

  drawArrowBySvgPath(
    arrow: Graphics,
    svgPath: string | undefined,
    colour: number
  ): void {
    // console.log('draw svg path', svgPath)
    if (!svgPath) return
    const pathData = svgPathParser(svgPath)
    arrow.beginFill(colour)
    for (let i = 0; i < pathData.length; i++) {
      switch (pathData[i].type) {
        case 'm':
          arrow.moveTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
          break
        case 'l':
          arrow.lineTo(pathData[i]['x'] as number, pathData[i]['y'] as number)
          break
        case 'a': {
          const bezierSegments = arcToCurve(
            pathData[i - 1]['x'] as number,
            pathData[i - 1]['y'] as number,
            pathData[i]['rx'] as number,
            pathData[i]['ry'] as number,
            pathData[i]['xRotation'] as number,
            pathData[i]['largeArc'] as number,
            pathData[i]['sweep'] as number,
            pathData[i]['x'] as number,
            pathData[i]['y'] as number
          )
          bezierSegments.forEach(bezierSegment =>
            arrow.bezierCurveTo(
              bezierSegment['x1'] as number,
              bezierSegment['y1'] as number,
              bezierSegment['x2'] as number,
              bezierSegment['y2'] as number,
              bezierSegment['x'],
              bezierSegment['y']
            )
          )
          break
        }
        case 'z':
          arrow.closePath()
          break
        default:
          break
      }
    }
    arrow.endFill()
  }

  drawRelationshipGfx(captionText: string, fontSize: number): Container {
    const relationshipGfx = new Container()
    // relationshipShapeGfx.x = relationship.source.x
    // relationshipShapeGfx.y = relationship.source.y
    relationshipGfx.pivot.set(0, 0)
    // relationshipShapeGfx.rotation = Math.atan2(
    //   relationship.target.y - relationship.source.y,
    //   relationship.target.x - relationship.source.x
    // )
    relationshipGfx.interactive = true
    relationshipGfx.buttonMode = true
    // relationshipGfx.on('mouseover', event => hoverLink(linkGfxToLinkData.get(event.currentTarget)));
    // relationshipGfx.on('mouseout', event => unhoverLink(linkGfxToLinkData.get(event.currentTarget)));

    // const line = new Sprite(Texture.WHITE)
    // line.name = LINE_NAME
    // line.x = NODE_BORDER_RADIUS
    // line.y = -relationshipSize / 2
    // line.width = relationshipLength
    // line.height = relationshipSize
    // line.tint = 0x0000
    // relationshipGfx.addChild(line)
    // relationshipsLayer.addChild(relationshipShapeGfx)

    const arrow = new Graphics()
    arrow.name = ARROW_NAME
    // drawArrowBySvgPath(
    //   arrow,
    //   relationship.arrow?.outline(0),
    //   colorToNumber(style.forRelationship(relationship).get('color'))
    // )
    relationshipGfx.addChild(arrow)

    const caption = new Text(captionText, {
      fontSize,
      fill: colourToNumber('#f4f4f4'),
      align: 'center'
    })
    caption.name = CAPTION_NAME
    caption.resolution = this._resolution * 4
    relationshipGfx.addChild(caption)

    return relationshipGfx
  }

  updateRelationshipCaption(
    caption: Text,
    text: string,
    x: number,
    y: number,
    rotation: number
  ): void {
    caption.text = text
    caption.pivot.x = caption.width / 2
    caption.pivot.y = caption.height / 2
    caption.x = x
    caption.y = y
    caption.rotation = rotation
  }
}

export default RelationshipRenderer
