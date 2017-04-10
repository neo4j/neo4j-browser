
import { withBus } from 'preact-suber'
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import StyledCodeBlock from './styled'

export const ClickToCode = ({CodeComponent = StyledCodeBlock, bus, code, children}) => {
  if (!children || !children[0]) return null
  code = code || children[0]
  return <CodeComponent onClick={() => bus.send(SET_CONTENT, setContent(code))}>{children[0]}</CodeComponent>
}

export default withBus(ClickToCode)
