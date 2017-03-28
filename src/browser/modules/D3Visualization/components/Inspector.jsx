import { Component } from 'preact'
import {StyledTokenContextMenuKey, StyledTokenRelationshipType, StyledLabelToken, StyledStatusBar, StyledStatus, StyledInspectorFooter, StyledInspectorFooterRow, StyledInspectorFooterRowListPair, StyledInspectorFooterRowListKey, StyledInspectorFooterRowListValue, StyledInlineList} from './styled'

export const InspectorComponent = ({hoveredItem, graphStyle}) => {
  let inspectorContent

  const mapItemProperties = (itemProperties) => {
    return itemProperties.map((prop, i) => {
      return (
        <StyledInspectorFooterRowListPair className='pair' key={i}>
          <StyledInspectorFooterRowListKey className='key'>{prop.key + ': '}</StyledInspectorFooterRowListKey>
          <StyledInspectorFooterRowListValue className='value'>{prop.value.toString()}</StyledInspectorFooterRowListValue>
        </StyledInspectorFooterRowListPair>
      )
    })
  }
  if (hoveredItem) {
    const item = hoveredItem.item
    if (hoveredItem.type === 'context-menu-item') {
      inspectorContent = (
        <StyledInlineList className='list-inline'>
          <StyledTokenContextMenuKey key='token' className={'token' + ' ' + 'token-context-menu-key' + ' ' + 'token-label'}>{item.label}</StyledTokenContextMenuKey>
          <StyledInspectorFooterRowListPair key='pair' className='pair'>
            <StyledInspectorFooterRowListValue className='value'>{item.content}</StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListPair>
        </StyledInlineList>
      )
    } else if (hoveredItem.type === 'canvas') {
      const description = `Displaying ${item.nodeCount} nodes, ${item.relationshipCount} relationships.`
      inspectorContent = (
        <StyledInlineList className='list-inline'>
          <StyledInspectorFooterRowListPair className='pair' key='pair'>
            <StyledInspectorFooterRowListValue className='value'>{description}</StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListPair>
        </StyledInlineList>
      )
    } else if (hoveredItem.type === 'node') {
      const style = {'backgroundColor': graphStyle.forNode(item).get('color'), 'color': graphStyle.forNode(item).get('text-color-internal')}
      inspectorContent = (
        <StyledInlineList className='list-inline'>
          <StyledLabelToken key='token' style={style} className={'token' + ' ' + 'token-label'}>{item.labels[0]}</StyledLabelToken>
          <StyledInspectorFooterRowListPair key='pair' className='pair'>
            <StyledInspectorFooterRowListKey className='key'>{'<id>:'}</StyledInspectorFooterRowListKey>
            <StyledInspectorFooterRowListValue className='value'>{item.id}</StyledInspectorFooterRowListValue>
          </StyledInspectorFooterRowListPair>
          {mapItemProperties(item.properties)}
        </StyledInlineList>
      )
    } else if (hoveredItem.type === 'relationship') {
      const style = {'backgroundColor': graphStyle.forRelationship(item).get('color'), 'color': graphStyle.forRelationship(item).get('text-color-internal')}
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
