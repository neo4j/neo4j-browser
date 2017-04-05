import { Component } from 'preact'
import { StyledRowToggle, StyledCaret } from './styled'

export class RowExpandToggleComponent extends Component {

  updateDimensions () {
    let rowHeight = this.props.rowElem ? this.props.rowElem.base.clientHeight : 0
    this.setState({rowHeight: rowHeight})
  }

  componentWillMount () {
    this.updateDimensions()
  }
  componentDidMount () {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  render () {
    this.state.rowHeight = this.props.rowElem ? this.props.rowElem.base.clientHeight : 0
    if (this.props.containerHeight * 1.1 < this.state.rowHeight) {
      return (
        <StyledRowToggle onClick={this.props.onClick}>
          <StyledCaret className={this.props.contracted ? 'fa fa-caret-left' : 'fa fa-caret-down'} />
        </StyledRowToggle>
      )
    } else {
      return null
    }
  }
}
