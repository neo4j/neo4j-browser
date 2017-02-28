import React from 'react'
import styles from './style.css'

export class ToolTip extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mouseover: false,
      id: props.id,
      icon: props.icon,
      name: props.tooltip,
      hidden: true
    }
  }
  onMouseEnterHandler () {
    this.setState({mouseover: true})
  }
  onMouseLeaveHandler () {
    this.setState({mouseover: false})
  }
  render () {
    const tooltip = null
    return (
      <div onMouseLeave={this.onMouseLeaveHandler.bind(this)} onMouseEnter={this.onMouseEnterHandler.bind(this)}>
        {this.props.children}
        {tooltip}
      </div>
    )
  }
}

export const CloseButton = (props) => {
  return (
    <button {...props}>×</button>
  )
}
export const EditorButton = (props) => {
  return (<button className={styles.editor}>{props.children}</button>)
}
export const FavoriteItem = (props) => {
  const {primaryText, removeClick, ...rest} = props
  const rightIcon = (removeClick) ? (<CloseButton className={styles.remove + ' remove'} onClick={props.removeClick} />) : null
  return (
    <li>
      <span {...rest}>{primaryText}</span>
      <span>{rightIcon}</span>
    </li>
  )
}

export const NavigationButton = (props) => {
  return (<button className={styles.navigation}>{props.children}</button>)
}
