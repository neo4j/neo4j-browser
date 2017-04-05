import { Component } from 'preact'
import {StyledTokenContextMenuKey, StyledRowToggle, StyledCaret, StyledTokenRelationshipType, StyledLabelToken, StyledStatusBar, StyledStatus, StyledInspectorFooter, StyledInspectorFooterRow, StyledInspectorFooterRowListPair, StyledInspectorFooterRowListKey, StyledInspectorFooterRowListValue, StyledInlineList} from './styled'
import {GrassEditor} from './GrassEditor'

export class InspectorComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.contracted = true
    this.state.graphStyle = this.props.graphStyle
  }

  setFooterRowELem (elem) {
    if (elem) {
      this.state.footerRowElem = elem
    }
  }

  updateDimensions () {
    let rowHeight = this.state.footerRowElem ? this.state.footerRowElem.base.clientHeight : 0
    this.setState({rowHeight: rowHeight})
  }

  componentWillMount () {
    this.updateDimensions()
  }
  componentDidMount () {
    this.updateDimensions()
    window.addEventListener('resize', this.updateDimensions.bind(this))
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions.bind(this))
  }

  render () {
    let item
    let type
    let inspectorContent

    const mapItemProperties = (itemProperties) => {
      return itemProperties.map((prop, i) => {
        return (
          <StyledInspectorFooterRowListPair className='pair' key={'prop' + i}>
            <StyledInspectorFooterRowListKey className='key'>{prop.key + ': '}</StyledInspectorFooterRowListKey>
            <StyledInspectorFooterRowListValue className='value'>{prop.value.toString()}</StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListPair>
        )
      })
    }

    const mapLabels = (itemLabels) => {
      return itemLabels.map((label, i) => {
        const graphStyleForLabel = this.state.graphStyle.forNode({labels: [label]})
        const style = {'backgroundColor': graphStyleForLabel.get('color'), 'color': graphStyleForLabel.get('text-color-internal')}
        return (
          <StyledLabelToken key={'label' + i} style={style} className={'token' + ' ' + 'token-label'}>{label}</StyledLabelToken>
        )
      })
    }
    if (this.props.hoveredItem && this.props.hoveredItem.type !== 'canvas') {
      item = this.props.hoveredItem.item
      type = this.props.hoveredItem.type
    } else if (this.props.selectedItem) {
      item = this.props.selectedItem.item
      type = this.props.selectedItem.type
    } else if (this.props.hoveredItem) {
      item = this.props.hoveredItem.item
      type = this.props.hoveredItem.type
    }
    if (item && type) {
      if (type === 'legend-item') {
        inspectorContent = (
          <GrassEditor selectedLabel={item.selectedLabel} selectedRelType={item.selectedRelType} />
        )
      }
      if (type === 'context-menu-item') {
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            <StyledTokenContextMenuKey key='token' className={'token' + ' ' + 'token-context-menu-key' + ' ' + 'token-label'}>{item.label}</StyledTokenContextMenuKey>
            <StyledInspectorFooterRowListPair key='pair' className='pair'>
              <StyledInspectorFooterRowListValue className='value'>{item.content}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
          </StyledInlineList>
        )
      } else if (type === 'canvas') {
        const description = `Displaying ${item.nodeCount} nodes, ${item.relationshipCount} relationships.`
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            <StyledInspectorFooterRowListPair className='pair' key='pair'>
              <StyledInspectorFooterRowListValue className='value'>{description}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
          </StyledInlineList>
        )
      } else if (type === 'node') {
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            {mapLabels(item.labels)}
            <StyledInspectorFooterRowListPair key='pair' className='pair'>
              <StyledInspectorFooterRowListKey className='key'>{'<id>:'}</StyledInspectorFooterRowListKey>
              <StyledInspectorFooterRowListValue className='value'>{item.id}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
            {mapItemProperties(item.properties)}
          </StyledInlineList>
        )
      } else if (type === 'relationship') {
        const style = {'backgroundColor': this.state.graphStyle.forRelationship(item).get('color'), 'color': this.state.graphStyle.forRelationship(item).get('text-color-internal')}
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            <StyledTokenRelationshipType key='token' style={style} className={'token' + ' ' + 'token-relationship-type'}>{item.type}</StyledTokenRelationshipType>
            <StyledInspectorFooterRowListPair key='pair' className='pair'>
              <StyledInspectorFooterRowListKey className='key'>{'<id>:'}</StyledInspectorFooterRowListKey>
              <StyledInspectorFooterRowListValue className='value'>{item.id}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
            {mapItemProperties(item.properties)}
          </StyledInlineList>
        )
      }
    }
    const rowToggle = () => {
      const oneline = 22
      if (oneline * 1.1 < this.state.rowHeight) {
        return (
          <StyledRowToggle onClick={() => { this.setState({ contracted: !this.state.contracted }) }}>
            <StyledCaret className={this.state.contracted ? 'fa fa-caret-left' : 'fa fa-caret-down'} />
          </StyledRowToggle>
        )
      } else {
        return null
      }
    }

    return (
      <StyledStatusBar className='status-bar'>
        <StyledStatus className='status'>
          <StyledInspectorFooter className={this.state.contracted ? 'contracted inspector-footer' : 'inspector-footer'}>
            <StyledInspectorFooterRow className='inspector-footer-row' ref={this.setFooterRowELem.bind(this)}>
              {rowToggle()}
              {inspectorContent}
            </StyledInspectorFooterRow>
          </StyledInspectorFooter>
        </StyledStatus>
      </StyledStatusBar>
    )
  }
}
