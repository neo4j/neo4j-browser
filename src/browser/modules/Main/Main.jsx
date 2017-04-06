import Editor from '../Editor/Editor'
import Stream from '../Stream/Stream'
import { StyledMain } from './styled'

const Main = (props) => {
  return (
    <StyledMain>
      <Editor />
      <Stream />
    </StyledMain>
  )
}

export default Main
