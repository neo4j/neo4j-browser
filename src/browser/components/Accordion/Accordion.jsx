import { Component } from 'preact'
import { BorderedWrapper, TitleBar, ContentArea } from './styled'

class Accordion extends Component {
  state = {
    activeIndex: -1,
    initialLoad: true
  }
  titleClick = index => {
    const newIndex = this.state.activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex, initialLoad: false })
  }
  getChildProps = ({ index, defaultActive = false, forceActive = false }) => {
    const props = {
      titleProps: {
        onClick: () => this.titleClick(index)
      },
      contentProps: {}
    }
    if (forceActive) {
      props.titleProps.onClick = () => {}
    }
    if (defaultActive && this.state.initialLoad) {
      props.titleProps.onClick = () => this.titleClick(-1)
    }
    if (
      index === this.state.activeIndex ||
      (this.state.initialLoad && defaultActive) ||
      forceActive
    ) {
      props.titleProps.active = true
      props.contentProps.active = true
      return props
    }
    props.titleProps.active = false
    props.contentProps.active = false
    return props
  }
  render () {
    const { getChildProps } = this
    return (
      <BorderedWrapper>{this.props.render({ getChildProps })}</BorderedWrapper>
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
