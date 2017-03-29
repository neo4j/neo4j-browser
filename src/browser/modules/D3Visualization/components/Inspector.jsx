import { Component } from 'preact'
import {StyledTokenContextMenuKey, StyledTokenRelationshipType, StyledLabelToken, StyledStatusBar, StyledStatus, StyledInspectorFooter, StyledInspectorFooterRow, StyledInspectorFooterRowListPair, StyledInspectorFooterRowListKey, StyledInspectorFooterRowListValue, StyledInlineList} from './styled'

export class InspectorComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.graphStyle = this.props.graphStyle
  }
  render () {
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

    if (this.props.hoveredItem) {
      const item = this.props.hoveredItem.item
      if (this.props.hoveredItem.type === 'context-menu-item') {
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            <StyledTokenContextMenuKey key='token' className={'token' + ' ' + 'token-context-menu-key' + ' ' + 'token-label'}>{item.label}</StyledTokenContextMenuKey>
            <StyledInspectorFooterRowListPair key='pair' className='pair'>
              <StyledInspectorFooterRowListValue className='value'>{item.content}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
          </StyledInlineList>
        )
      } else if (this.props.hoveredItem.type === 'canvas') {
        const description = `Displaying ${item.nodeCount} nodes, ${item.relationshipCount} relationships.`
        inspectorContent = (
          <StyledInlineList className='list-inline'>
            <StyledInspectorFooterRowListPair className='pair' key='pair'>
              <StyledInspectorFooterRowListValue className='value'>{description}</StyledInspectorFooterRowListValue>
            </StyledInspectorFooterRowListPair>
          </StyledInlineList>
        )
      } else if (this.props.hoveredItem.type === 'node') {
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
      } else if (this.props.hoveredItem.type === 'relationship') {
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
    return (
      <StyledStatusBar className='status-bar'>
        <StyledStatus className='status'>
          <StyledInspectorFooter className='inspector-footer'>
            <StyledInspectorFooterRow className='inspector-footer-row'>
              {inspectorContent}
            </StyledInspectorFooterRow>
          </StyledInspectorFooter>
        </StyledStatus>
      </StyledStatusBar>

    )
  }
}
