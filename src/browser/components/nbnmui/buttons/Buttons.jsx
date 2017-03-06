import { Component } from 'preact'
import styles from './style.css'

export class ToolTip extends Component {
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
  return (<button {...props} className={styles.editor}>{props.children}</button>)
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
export const FormButton = (props) => {
  const {icon, label, children, ...rest} = props

  if (icon && label) return (<button {...rest} type='button'>{label} {icon}</button>)
  if (icon) return (<button {...rest} type='button'>{icon}</button>)
  if (label) return (<button {...rest} type='button'>{label}</button>)
  return (<button {...props} type='button'>{children}</button>)
}
export const CypherFrameButton = (props) => {
  const {selected, icon, ...rest} = props
  const isSelected = (selected) ? 'selected' : 'unselected'
  return (<button className={isSelected} {...rest}>{icon}</button>)
}
export const FrameButton = (props) => {
  const {icon, ...rest} = props
  return (<button {...rest}>{icon}</button>)
}

export const ActionButton = (props) => {
  const {className, ...rest} = props
  return (<button className={className + ' ' + styles.action} {...rest} />)
}
