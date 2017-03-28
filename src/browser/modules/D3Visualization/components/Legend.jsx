import { Component } from 'preact'
import {StyledTokenRelationshipType, StyledLegendInlineListItem, StyledLegend, StyledLegendContents, StyledLabelToken, StyledTokenCount, StyledLegendInlineList} from './styled'

export const LegendComponent = ({stats, graphStyle}) => {
  const mapLabels = (labels) => {
    const labelList = Object.keys(labels).map((legendItemKey, i) => {
      const styleForItem = graphStyle.forNode({labels: [legendItemKey]})
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <StyledLegendInlineListItem key={i}>
          <StyledLabelToken style={style} className='token token-label'>
            {legendItemKey}
            <StyledTokenCount className='count'>{`(${labels[legendItemKey]})`}</StyledTokenCount>
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
      const styleForItem = graphStyle.forRelationship({type: [legendItemKey]})
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <StyledLegendInlineListItem key={i}>
          <StyledLegendContents className='contents'>
            <StyledTokenRelationshipType style={style} className='token token-relationship-type'>
              {legendItemKey}
              <StyledTokenCount className='count'>{`(${legendItems[legendItemKey]})`}</StyledTokenCount>
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
