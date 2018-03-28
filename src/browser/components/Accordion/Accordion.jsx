import { Component } from 'preact'
import { BorderedWrapper, TitleBar, ContentArea } from './styled'

class Accordion extends Component {
  state = {
    activeIndex: -1
  }
  accordionClick = index => {
    const newIndex = this.state.activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }
  render () {
    const { activeIndex } = this.state
    const { accordionClick } = this
    return (
      <BorderedWrapper>
        {this.props.render({ activeIndex, accordionClick })}
      </BorderedWrapper>
    )
  }
}
const Title = ({ children, ...rest }) => {
  return <TitleBar {...rest}>{children}</TitleBar>
}
Accordion.Title = Title

const Content = ({ children, active, ...rest }) => {
  if (!active) return null
  return <ContentArea {...rest}>{children}</ContentArea>
}
Accordion.Content = Content

export default Accordion
