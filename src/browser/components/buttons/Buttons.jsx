import { Component } from 'preact'
import styled from 'styled-components'
import { dim } from 'browser-styles/constants'

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

export const EditorButton = styled.a`
    color: ${props => props.theme.secondaryButtonText};
    background-color: ${props => props.theme.secondaryButtonBackground};
    border: ${props => props.theme.secondaryButtonBorder};
    border-radius: 50%;
    width: 28px;
    height: 28px;
    font-size: 20px;
    line-height: 27px;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    &:hover {
      background-color: ${props => props.theme.secondaryButtonBackgroundHover};
      color: ${props => props.theme.editorBarBackground};
      border: ${props => props.theme.secondaryButtonBorderHover};
      text-decoration: none;
    }
  `

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
export const CypherFrameButton = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  border-bottom: ${props => props.theme.inFrameBorder};
  height: ${dim.frameTitlebarHeight}px;
  width: 74px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 40px;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.editorBarBackground};
    text-decoration: none;
  }
`

export const FrameButton = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  border-left: ${props => props.theme.inFrameBorder};
  border-right: ${props => props.theme.inFrameBorder};
  height: ${dim.frameTitlebarHeight}px;
  width: 41px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 40px;
  display: inline-block;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.editorBarBackground};
    text-decoration: none;
  }
`

export const ActionButton = (props) => {
  const {className, ...rest} = props
  return (<button className={className + ' ' + styles.action} {...rest} />)
}
