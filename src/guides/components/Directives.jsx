import React from 'react'
import { connect } from 'react-redux'
import editor from '../../lib/containers/editor'

const directives = [{
  attributeName: 'play-topic',
  command: 'play'
}, {
  attributeName: 'help-topic',
  command: 'help'
}]

const DirectivesComponent = (props) => {
  const callback = (elem) => {
    if (elem) {
      directives.forEach((directive) => {
        const elems = elem.querySelectorAll(`[${directive.attributeName}]`)
        Array.from(elems).forEach((e) => {
          e.onclick = () => {
            return props.onItemClick(`:${directive.command} ${e.getAttribute(directive.attributeName)}`)
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
