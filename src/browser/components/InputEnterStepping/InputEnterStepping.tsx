import { Component } from 'react'

type State = any

export default class InputEnterStepping extends Component<any, State> {
  state = {
    initial: true
  }

  steps: any[] = []
  getSubmitProps = () => {
    return {
      onClick: this.props.submitAction
    }
  }

  getInputPropsForIndex = (i: any, props: any = {}) => {
    this.steps[i] = this.steps[i] || {}
    const { initialFocus, ...cleanProps } = props
    const out = {
      ...cleanProps,
      onKeyDown: (e: any) => {
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

  onKeyDown = (e: any, i: any) => {
    const ENTER_KEYCODE = 13
    if (e.keyCode === ENTER_KEYCODE) {
      e.preventDefault()
      if (i !== this.steps.length - 1) {
        this.steps[i + 1].focusFn && this.steps[i + 1].focusFn()
      } else {
        this.props.submitAction && this.props.submitAction(e)
      }
    }
  }

  setRefForIndex = (i: any, ref: any) => {
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
