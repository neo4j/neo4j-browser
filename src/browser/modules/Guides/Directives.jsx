import React from 'react'
import { connect } from 'react-redux'
import * as editor from '../../../shared/modules/history/historyDuck'

const directives = [{
  selector: '[play-topic]',
  valueExtractor: (elem) => {
    return `:play ${elem.getAttribute('play-topic')}`
  }
}, {
  selector: '[help-topic]',
  valueExtractor: (elem) => {
    return `:help ${elem.getAttribute('help-topic')}`
  }
}, {
  selector: '.runnable',
  valueExtractor: (elem) => {
    return elem.textContent
  }
}]

export const Directives = (props) => {
  const callback = (elem) => {
    if (elem) {
      directives.forEach((directive) => {
        const elems = elem.querySelectorAll(directive.selector)
        Array.from(elems).forEach((e) => {
          e.onclick = () => {
            return props.onItemClick(directive.valueExtractor(e))
          }
        })
      })
    }
  }
  return (
    <span ref={callback}>
      {props.content}
    </span>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.setContent(cmd))
    }
  }
}

export default connect(null, mapDispatchToProps)(Directives)
