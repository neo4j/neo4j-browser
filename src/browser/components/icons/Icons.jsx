import { Component } from 'preact'
import styled from 'styled-components'
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
    const {activeStyle, inactiveStyle, isOpen, text, ...rest} = this.props
    const state = (this.state.mouseover || isOpen) ? activeStyle || '' : inactiveStyle || ''
    const newClass = this.props.suppressIconStyles ? this.props.className : state + ' ' + this.props.className
    return text
      ? <span><i {...rest} className={newClass} onMouseEnter={this.mouseover.bind(this)} onMouseLeave={this.mouseout.bind(this)} /><StyledText>{text}</StyledText></span>
      : <i {...rest} className={newClass} onMouseEnter={this.mouseover.bind(this)} onMouseLeave={this.mouseout.bind(this)} />
  }
}

const StyledText = styled.div`
  font-size: 9px;
  line-height: 10px;
  margin-top: 4px;
  padding: 0;
`

export const DatabaseIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.green} inactiveStyle={styles.inactive} className='sl sl-database' />)
export const FavoritesIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.orange} inactiveStyle={styles.inactive} className='sl sl-star' />)
export const DocumentsIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl sl-book' />)
export const CloudIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.purple} inactiveStyle={styles.inactive} className='sl sl-cloud' />)
export const SettingsIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.red} inactiveStyle={styles.inactive} className='sl sl-setting-gear' />)
export const AboutIcon = ({isOpen}) => (<IconContainer isOpen={isOpen} activeStyle={styles.credits} inactiveStyle={styles.inactive} className='nw nw-neo4j-outline-32px' />)

export const TableIcon = () => (<IconContainer className='fa fa-table' text='Table' />)
export const VisualizationIcon = () => (<IconContainer className='nw nw-neo4j-outline-16px' text='Graph' />)
export const AsciiIcon = () => (<IconContainer className='fa fa-font' text='Text' />)
export const CodeIcon = () => (<IconContainer className='fa fa-code' text='Code' />)
export const PlanIcon = () => (<IconContainer activeStyle={styles.active} inactiveStyle={styles.inactive} className='sl-hierarchy' text='Plan' />)
export const AlertIcon = () => (<IconContainer activeStyle={styles.active} inactiveStyle={styles.inactive} className='sl-alert' />)

export const BinIcon = (props) => (<IconContainer activeStyle={styles.white} inactiveStyle={styles.inactive} {...props} className='sl-bin' />)

export const ExpandIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-scale-spread' />)
export const ContractIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-scale-reduce' />)
export const RefreshIcon = () => (<IconContainer>Refresh</IconContainer>)
export const CloseIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-delete' />)
export const UpIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-chevron-up' />)
export const DownIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl-chevron-down' />)
export const PinIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-pin' />)
export const MinusIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl-minus-circle' />)
export const RightArrowIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl-arrow-circle-right' />)
export const CancelIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='sl-delete-circle' />)
export const DownloadIcon = () => (<IconContainer activeStyle={styles.inactive} inactiveStyle={styles.inactive} className='sl-download-drive' />)
export const ExpandMenuIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='fa fa-caret-right' />)
export const CollapseMenuIcon = () => (<IconContainer activeStyle={styles.blue} inactiveStyle={styles.inactive} className='fa fa-caret-down' />)
