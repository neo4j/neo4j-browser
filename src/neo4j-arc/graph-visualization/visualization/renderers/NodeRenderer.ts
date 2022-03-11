import {
  AbstractRenderer,
  Circle,
  Container,
  Graphics,
  RenderTexture,
  Sprite,
  Text,
  settings
} from 'pixi.js'

import { CAPTION_NAME, CIRCLE_NAME } from '../../constants'
import { colourToNumber } from '../../utils/colour'

const TEXTURE_COLOR = 0xffffff

class NodeRenderer {
  private _renderer: AbstractRenderer
  private _circleGrapicsTextureMap: Record<number, RenderTexture>
  private _resolution: number

  constructor(renderer: AbstractRenderer, resolution: number) {
    this._renderer = renderer
    this._circleGrapicsTextureMap = {}
    this._resolution = resolution
  }

  drawCircleGraphicsByRadius(radius: number): RenderTexture {
    // create textures: circle, circle border
    const circleGraphics = new Graphics()
    circleGraphics.beginFill(TEXTURE_COLOR)
    circleGraphics.drawCircle(radius, radius, radius)

    const circleTexture = this._renderer.generateTexture(circleGraphics, {
      scaleMode: settings.SCALE_MODE,
      resolution: this._resolution * 4
    })

    return circleTexture
  }

  getCircleGraphicsTextureByRadius(radius: number): RenderTexture {
    if (!this._circleGrapicsTextureMap[radius]) {
      this._circleGrapicsTextureMap[radius] =
        this.drawCircleGraphicsByRadius(radius)
    }

    return this._circleGrapicsTextureMap[radius]
  }

  drawNodeCircleSprite(radius: number, colour: string, opacity = 1): Sprite {
    const circle = new Sprite(this.getCircleGraphicsTextureByRadius(radius))
    circle.name = CIRCLE_NAME
    circle.x = -circle.width / 2
    circle.y = -circle.height / 2
    circle.tint = colourToNumber(colour)
    circle.alpha = opacity

    return circle
  }

  drawNodeShapeGfx(radius: number, colour: string): Container {
    const nodeShapeGfx = new Container()
    nodeShapeGfx.interactive = true
    nodeShapeGfx.buttonMode = true
    nodeShapeGfx.hitArea = new Circle(0, 0, radius)

    nodeShapeGfx.addChild(this.drawNodeCircleSprite(radius, colour))

    return nodeShapeGfx
  }

  drawNodeCaptionGfx(
    captionText: string,
    fontSize: number,
    colour: string
  ): Container {
    const nodeCaptionGfx = new Container()

    // const caption = new BitmapText(/* LABEL_TEXT(nodeData) */'TEST', {
    //   // font: {
    //   //   name: LABEL_FONT_FAMILY,
    //   //   size: LABEL_FONT_SIZE
    //   // },
    //   fontName: "Arial",
    //   align: 'center',
    //   tint: LABEL_COLOR
    // });
    const caption = new Text(captionText, {
      fontFamily: 'sans-serif',
      fontSize: fontSize * 0.98,
      fill: colourToNumber(colour),
      align: 'center',
      lineHeight: fontSize * 1.15
    })
    caption.resolution = this._resolution * 4
    caption.name = CAPTION_NAME
    caption.x = -caption.width / 2
    caption.y = -caption.height / 2
    nodeCaptionGfx.addChild(caption)

    return nodeCaptionGfx
  }
}

export default NodeRenderer
