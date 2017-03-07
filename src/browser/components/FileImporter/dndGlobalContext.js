import { DragDropManager } from 'dnd-core'
import HTML5Backend from 'react-dnd-html5-backend'
import { Component } from 'preact'

let defaultManager

/**
 * This is singleton used to initialize only once dnd in our app.
 * If you initialized dnd and then try to initialize another dnd
 * context the app will break.
 * Here is more info: https://github.com/gaearon/react-dnd/issues/186
 *
 * The solution is to call Dnd context from this singleton this way
 * all dnd contexts in the app are the same.
 */
const getDndContext = () => {
  if (defaultManager) return defaultManager
  defaultManager = new DragDropManager(HTML5Backend)

  return defaultManager
}

class DndContextWrapping extends Component {

  getChildContext () {
    return {
      dragDropManager: getDndContext()
    }
  }
  render () {
    let childProps = {...this.props}
    delete childProps.Component
    return (
      <this.props.Component {...childProps} />
    )
  }
}

export const wrapWithDndContext = (Component) => {
  return (props) => {
    return (<DndContextWrapping {...props} Component={Component} />)
  }
}
