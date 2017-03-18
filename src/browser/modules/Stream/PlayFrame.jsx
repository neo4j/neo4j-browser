import Guides from '../Guides/Guides'
import * as html from '../Guides/html'
import FrameTemplate from './FrameTemplate'

const PlayFrame = ({frame}) => {
  let guide = 'Play guide not specified'
  if (frame.result) {
    guide = <Guides withDirectives html={frame.result} />
  } else {
    const guideName = frame.cmd.replace(':play', '').replace(/\s|-/g, '').trim()
    if (guideName !== '') {
      const content = html.default[guideName]
      if (content !== undefined) {
        guide = <Guides withDirectives html={content} />
      } else {
        if (frame.error && frame.error.error) {
          guide = frame.error.error
        } else {
          guide = 'Guide not found'
        }
      }
    }
  }
  return (
    <FrameTemplate
      className='playFrame'
      header={frame}
      contents={guide}
    />
  )
}
export default PlayFrame
