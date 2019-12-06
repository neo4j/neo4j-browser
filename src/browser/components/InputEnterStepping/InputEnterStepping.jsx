import { Component } from 'react'

export default class InputEnterStepping extends Component {
  state = {
    initial: true
  }

  steps = []
  getSubmitProps = () => {
    return {
      onClick: this.props.submitAction
    }
  }

  getInputPropsForIndex = (i, props = {}) => {
    this.steps[i] = this.steps[i] || {}
    const { initialFocus, ...cleanProps } = props
    const out = {
      ...cleanProps,
      onKeyDown: e => {
        // merge with users onKeyDown
        this.onKeyDown(e, i)
        props.onKeyDown && props.onKeyDown(e)
      }
    }
    if (initialFocus) {
      this.steps[i].focusOnRef = true
    }
    return out
  }

  onKeyDown = (e, i) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      if (i !== this.steps.length - 1) {
        this.steps[i + 1].focusFn && this.steps[i + 1].focusFn()
      } else {
        this.props.submitAction && this.props.submitAction(e)
      }
    }
  }

  setRefForIndex = (i, ref) => {
    this.steps[i] = this.steps[i] || {}
    this.steps[i].focusFn = () => ref.focus()
    if (this.state.initial && this.steps[i].focusOnRef) {
      delete this.steps[i].focusOnRef
      this.setState({ initial: false }, () => {
        setTimeout(this.steps[i].focusFn, 0)
      })
    }
  }

  render() {
    return this.props.render({
      getInputPropsForIndex: this.getInputPropsForIndex,
      getSubmitProps: this.getSubmitProps,
      setRefForIndex: this.setRefForIndex
    })
  }
}
