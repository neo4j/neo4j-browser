import React from 'react'
import ListItem from 'grommet/components/ListItem'
import Button from 'grommet/components/Button'
import uuid from 'uuid'
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
    const tooltip = (this.state.mouseover) ? <span className={styles.tooltip}>{this.state.name}</span> : null
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
    <Button {...props} className={styles.icon}>×</Button>
  )
}
export const EditorButton = (props) => {
  const {tooltip, ...rest} = props
  const id = 'a' + uuid.v4()
  const button = <Button id={id} {...rest} />
  return (
    <ToolTip id={id} tooltip={tooltip}>
      {button}
    </ToolTip>
  )
}
export const FavoriteItem = (props) => {
  const {primaryText, removeClick, ...rest} = props
  const rightIcon = (removeClick) ? (<CloseButton onClick={props.removeClick} />) : null
  return (
    <ListItem className='remove'>
      <span {...rest}>
        <p>{primaryText}</p>
      </span>
      <span>
        {rightIcon}
      </span>
    </ListItem>
  )
}

export const NavigationButton = (props) => {
  const id = 'a' + uuid.v4()
  return (
    <ToolTip id={id} tooltip={props.name}>
      <Button {...props} id={id} icon={props.icon} />
    </ToolTip>
  )
}
