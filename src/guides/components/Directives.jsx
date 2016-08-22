import React from 'react'
import { connect } from 'react-redux'
import editor from 'containers/editor'

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

const DirectivesComponent = (props) => {
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
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const Directives = connect(null, mapDispatchToProps)(DirectivesComponent)

export default Directives
export {
  DirectivesComponent
}
