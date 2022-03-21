import { degreeToRadian } from '../../utils/maths'
import {
  Container,
  DisplayObject,
  Graphics,
  Resource,
  Sprite,
  Texture,
  AbstractRenderer,
  SpriteMaskFilter
} from 'pixi.js'
import { colourToNumber } from '../../utils/colour'
import { SELECT_HIGHLIGHT_COLOUR } from '../../constants'

const getExpandeCollapseIconSvg = (colour: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="icon"><defs><style>.a{fill:none;stroke:${colour};stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style></defs><title>Expand / Collapse</title><circle class="a" cx="13.5" cy="10.498" r="3.75"/><circle class="a" cx="21" cy="2.998" r="2.25"/><circle class="a" cx="21" cy="15.748" r="2.25"/><circle class="a" cx="13.5" cy="20.998" r="2.25"/><circle class="a" cx="3" cy="20.998" r="2.25"/><circle class="a" cx="3.75" cy="5.248" r="2.25"/><line class="a" x1="16.151" y1="7.848" x2="19.411" y2="4.588"/><line class="a" x1="16.794" y1="12.292" x2="19.079" y2="14.577"/><line class="a" x1="13.5" y1="14.248" x2="13.5" y2="18.748"/><line class="a" x1="10.851" y1="13.147" x2="4.59" y2="19.408"/><line class="a" x1="10.001" y1="9.149" x2="5.61" y2="6.514"/></g></svg>`
const getRemoveNodeIconSvg = (colour: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g class="icon"><defs><style>.a{fill:none;stroke:${colour};stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}</style></defs><title>Remove</title><path class="a" d="M8.153,13.664a12.271,12.271,0,0,1-5.936-4.15L1.008,7.96a.75.75,0,0,1,0-.92L2.217,5.486A12.268,12.268,0,0,1,11.9.75h0a12.269,12.269,0,0,1,9.684,4.736L22.792,7.04a.748.748,0,0,1,0,.92L21.584,9.514"/><path class="a" d="M10.4,10.937A3.749,3.749,0,1,1,15.338,9"/><circle class="a" cx="17.15" cy="17.25" r="6"/><line class="a" x1="14.15" y1="17.25" x2="20.15" y2="17.25"/></g></svg>`

class ContextMenuRenderer {
  private _renderer: AbstractRenderer
  private _expandCollapseSection: Container
  private _closeNodeSection: Container

  constructor(renderer: AbstractRenderer) {
    this._renderer = renderer
    this._expandCollapseSection = new Container()
    this._closeNodeSection = new Container()
  }

  get expandCollpaseItem(): Container {
    return this._expandCollapseSection
  }

  get closeNodeSection(): Container {
    return this._closeNodeSection
  }

  private drawArc(
    arcRadius: number,
    division: number,
    colour: string,
    rotation: number
  ): Container {
    const arcSection = new Container()
    arcSection.interactive = true
    arcSection.buttonMode = true
    const arcGraphics = new Graphics()
    arcGraphics.beginFill(0xffffff)
    arcGraphics.lineTo(0, 0)
    arcGraphics.arc(0, 0, arcRadius, 0, degreeToRadian(360 / division))
    arcGraphics.lineTo(0, 0)
    arcGraphics.endFill()
    const arcTexture = this._renderer.generateTexture(arcGraphics)
    const arcSprite = new Sprite(arcTexture)
    arcSprite.pivot.x =
      Math.sin(degreeToRadian(360 / division - 90)) * arcRadius
    arcSprite.rotation = degreeToRadian(rotation)
    arcSprite.tint = colourToNumber(colour)
    arcSection.addChild(arcSprite)

    return arcSection
  }

  private drawRingMask(outerRadius: number, innerRadius: number): Sprite {
    const circleRingGfx = new Graphics()
    circleRingGfx.beginFill(0xffffff)
    circleRingGfx.drawCircle(0, 0, outerRadius)
    circleRingGfx.endFill()

    const circleGfx = new Graphics()
    circleGfx.beginFill(0x000000)
    circleGfx.drawCircle(0, 0, innerRadius)
    circleGfx.endFill()

    const ringMaskGfx = new Container()
    ringMaskGfx.addChild(circleRingGfx)
    ringMaskGfx.addChild(circleGfx)
    const ringMaskTexture = this._renderer.generateTexture(ringMaskGfx)
    const ringMaskSprite = new Sprite(ringMaskTexture)
    ringMaskSprite.x = -ringMaskSprite.width / 2
    ringMaskSprite.y = -ringMaskSprite.height / 2

    return ringMaskSprite
  }

  drawContextMenu(outerRadius: number, innerRadius: number): DisplayObject {
    const contextMenuGfx = new Container()

    const arcMaskSprite = this.drawRingMask(outerRadius, innerRadius + 4)
    contextMenuGfx.addChild(arcMaskSprite)

    const expandCollapseSection = this.drawArc(outerRadius, 3, '#ff0000', 30)
    this._expandCollapseSection = expandCollapseSection
    // Width = 75; Height = 75;
    const expandCollapseSvgSprite = Sprite.from(
      getExpandeCollapseIconSvg('#ffffff')
    )
    setTimeout(
      () =>
        console.log(
          expandCollapseSvgSprite.width,
          expandCollapseSvgSprite.height
        ),
      300
    )
    expandCollapseSvgSprite.pivot.set(75)
    expandCollapseSvgSprite.scale.set(0.08)
    expandCollapseSvgSprite.y = outerRadius - 12

    expandCollapseSection.addChild(expandCollapseSvgSprite)
    contextMenuGfx.addChild(expandCollapseSection)
    expandCollapseSection.filters = [new SpriteMaskFilter(arcMaskSprite)]

    const closeNodeSection = this.drawArc(outerRadius, 3, '#00ff00', -90)
    this._closeNodeSection = closeNodeSection
    // Width = 150; Height = 150
    const closeNodeSvgSprite = Sprite.from(getRemoveNodeIconSvg('#ffffff'))
    setTimeout(
      () => console.log(closeNodeSvgSprite.width, closeNodeSvgSprite.height),
      300
    )
    closeNodeSvgSprite.pivot.set(150, 0)
    closeNodeSvgSprite.scale.set(0.08)
    closeNodeSvgSprite.x = ((outerRadius - 12) / 2) * Math.sqrt(3) + 6
    closeNodeSvgSprite.y = -(outerRadius - 12) / 2 - 6
    closeNodeSection.addChild(closeNodeSvgSprite)

    contextMenuGfx.addChild(closeNodeSection)
    closeNodeSection.filters = [new SpriteMaskFilter(arcMaskSprite)]

    const circle = new Graphics()
    circle.beginFill(0xffffff)
    circle.drawCircle(0, 0, innerRadius + 4)
    circle.endFill()
    const circleTexture = this._renderer.generateTexture(circle)
    const circleSprite = new Sprite(circleTexture)
    circleSprite.x = -circleSprite.width / 2
    circleSprite.y = -circleSprite.height / 2
    circleSprite.tint = colourToNumber(SELECT_HIGHLIGHT_COLOUR)
    circleSprite.alpha = 0.35
    contextMenuGfx.addChild(circleSprite)

    const circleMaskSprite = this.drawRingMask(innerRadius + 4, innerRadius)
    contextMenuGfx.addChild(circleMaskSprite)

    circleSprite.filters = [new SpriteMaskFilter(circleMaskSprite)]

    return contextMenuGfx
  }
}

export default ContextMenuRenderer
