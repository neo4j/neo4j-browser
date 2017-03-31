import { Component } from 'preact'
import {StyledTokenRelationshipType, StyledLegendInlineListItem, StyledLegend, StyledLegendContents, StyledLabelToken, StyledTokenCount, StyledLegendInlineList} from './styled'

export const LegendComponent = ({stats, graphStyle, onSelectedLabel, onSelectedRelType}) => {
  const mapLabels = (labels) => {
    const labelList = Object.keys(labels).map((legendItemKey, i) => {
      const styleForItem = graphStyle.forNode({labels: [legendItemKey]})
      const onClick = () => { onSelectedLabel(legendItemKey, Object.keys(labels[legendItemKey].properties)) }
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <StyledLegendInlineListItem key={i}>
          <StyledLabelToken onClick={onClick} style={style} className='token token-label'>
            {legendItemKey}
            <StyledTokenCount className='count'>{`(${labels[legendItemKey].count})`}</StyledTokenCount>
          </StyledLabelToken>
        </StyledLegendInlineListItem>
      )
    })
    return (
      <StyledLegendInlineList className='list-inline'>
        {labelList}
      </StyledLegendInlineList>
    )
  }
  const mapRelTypes = (legendItems) => {
    const relTypeList = Object.keys(legendItems).map((legendItemKey, i) => {
      const styleForItem = graphStyle.forRelationship({type: legendItemKey})
      const onClick = () => { onSelectedRelType(legendItemKey, Object.keys(legendItems[legendItemKey].properties)) }
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <StyledLegendInlineListItem key={i}>
          <StyledLegendContents className='contents'>
            <StyledTokenRelationshipType onClick={onClick} style={style} className='token token-relationship-type'>
              {legendItemKey}
              <StyledTokenCount className='count'>{`(${legendItems[legendItemKey].count})`}</StyledTokenCount>
            </StyledTokenRelationshipType>
          </StyledLegendContents>
        </StyledLegendInlineListItem>
      )
    })
    return (
      <StyledLegendInlineList className='list-inline'>
        {relTypeList}
      </StyledLegendInlineList>
    )
  }
  return (
    <StyledLegend className='legend'>
      {mapLabels(stats.labels)}
      {mapRelTypes(stats.relTypes)}
    </StyledLegend>

  )
}
