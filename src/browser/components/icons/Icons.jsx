import { Component } from 'preact'
import styles from './icons.css'

class IconContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mouseover: false
    }
  }
  mouseover () {
    this.setState({mouseover: true})
  }
  mouseout () {
    this.setState({mouseover: false})
  }
  render () {
    const {activeStyle, inactiveStyle, ...rest} = this.props
    const state = (this.state.mouseover) ? activeStyle || '' : inactiveStyle || ''
    const newClass = state + ' ' + this.props.className
    return <i {...rest} className={newClass} onMouseEnter={this.mouseover.bind(this)} onMouseLeave={this.mouseout.bind(this)} />
  }
}

export const DatabaseIcon = () => (<IconContainer activeStyle={styles.green} inactiveStyle={styles.inactive} className='sl sl-database' />)
export const FavoritesIcon = () => (<IconContainer activeStyle={styles.orange} inactiveStyle={styles.inactive} className='sl sl-star' />)
export const DocumentsIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl sl-book' />)
export const CloudIcon = () => (<IconContainer activeStyle={styles.purple} inactiveStyle={styles.inactive} className='sl sl-cloud' />)
export const SettingsIcon = () => (<IconContainer activeStyle={styles.red} inactiveStyle={styles.inactive} className='sl sl-setting-gear' />)
export const AboutIcon = () => (<IconContainer activeStyle={styles.credits} inactiveStyle={styles.inactive} className='nw nw-neo4j-outline-32px' />)

export const TableIcon = () => (<IconContainer>Table</IconContainer>)
export const VisualizationIcon = () => (<IconContainer>Viz</IconContainer>)
export const AsciiIcon = () => (<IconContainer>Ascii</IconContainer>)
export const CodeIcon = () => (<IconContainer>Code</IconContainer>)
export const PlanIcon = () => (<IconContainer activeStyle={styles.active} inactiveStyle={styles.inactive} className='sl-hierarchy' />)

export const ExpandIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-scale-spread' />)
export const ContractIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-scale-reduce' />)
export const RefreshIcon = () => (<IconContainer>Refresh</IconContainer>)
export const CloseIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-delete' />)
export const UpIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-chevron-up' />)
export const DownIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-chevron-down' />)
export const PinIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-pin' />)
