import React from 'react'
import ListItem from 'grommet/components/ListItem'
import Button from 'grommet/components/Button'
import Tip from 'grommet/components/Tip'
import styles from './style.css'

export const CloseButton = (props) => {
  return (
    <Button {...props} className={styles.icon}>×</Button>
  )
}
export const EditorButton = (props) => {
  return (
    <Button {...props} />
  )
}
export const FavoriteItem = (props) => {
  const primaryText = (<p>{props.primaryText}</p>)
  const rightIcon = (props.removeClick) ? (<CloseButton onClick={props.removeClick} />) : null
  return (
    <ListItem className='remove'>
      <span {...props}>
        {primaryText}
      </span>
      <span>
        {rightIcon}
      </span>
    </ListItem>
  )
}

export class NavigationButton extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      mouseover: false,
      id: props.id,
      icon: props.icon,
      name: props.name,
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
    const tooltip = (this.state.mouseover) ? <Tip className={this.state.hidden} onClose={() => {}} target={this.state.id}>{this.state.name}</Tip> : null

    return (
      <div onMouseLeave={this.onMouseLeaveHandler.bind(this)} onMouseEnter={this.onMouseEnterHandler.bind(this)}>
        <Button {...this.props} id={this.state.id} icon={this.state.icon} />
        {tooltip}
      </div>
    )
  }
}
