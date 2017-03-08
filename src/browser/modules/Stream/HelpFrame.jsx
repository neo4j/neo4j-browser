import Slide from '../Guides/Slide'
import * as html from '../Help/html'
import Directives from 'browser-components/Directives'
import FrameTemplate from './FrameTemplate'

const HelpFrame = ({frame}) => {
  let help = 'Help topic not specified'
  if (frame.result) {
    help = <Slide html={frame.result} />
  } else {
    const helpTopic = '_' + frame.cmd.replace(':help', '').trim()
    if (helpTopic !== '') {
      const content = html.default[helpTopic]
      if (content !== undefined) {
        help = <Slide html={content} />
      } else {
        help = 'Guide not found'
      }
    }
  }
  return (
    <FrameTemplate
      className='helpFrame'
      header={frame}
      contents={<Directives content={help} />}
    />
  )
}
export default HelpFrame
