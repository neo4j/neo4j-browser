import {Component} from 'preact'
import {legendRowHeight, StyledLegendRow, StyledTokenRelationshipType, StyledLegendInlineListItem, StyledLegend, StyledLegendContents, StyledLabelToken, StyledTokenCount, StyledLegendInlineList} from './styled'
import {RowExpandToggleComponent} from './RowExpandToggle'

export class LegendComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.state.typeRowContracted = true
    this.state.labelRowContracted = true
  }

  setTypeRowELem (elem) {
    if (elem) {
      this.state.typeRowElem = elem
    }
  }
  setLabelRowELem (elem) {
    if (elem) {
      this.state.labelRowELem = elem
    }
  }
  render () {
    const mapLabels = (labels) => {
      const labelList = Object.keys(labels).map((legendItemKey, i) => {
        const styleForItem = this.props.graphStyle.forNode({labels: [legendItemKey]})
        const onClick = () => { this.props.onSelectedLabel(legendItemKey, Object.keys(labels[legendItemKey].properties)) }
        const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
        return (
          <StyledLegendInlineListItem key={i}>
            <StyledLegendContents className='contents'>
              <StyledLabelToken onClick={onClick} style={style} className='token token-label'>
                {legendItemKey}
                <StyledTokenCount className='count'>{`(${labels[legendItemKey].count})`}</StyledTokenCount>
              </StyledLabelToken>
            </StyledLegendContents>
          </StyledLegendInlineListItem>
        )
      })
      return (
        <StyledLegendRow className={this.state.labelRowContracted ? 'contracted' : ''}>
          <StyledLegendInlineList className='list-inline' ref={this.setLabelRowELem.bind(this)}>
            <RowExpandToggleComponent contracted={this.state.labelRowContracted} rowElem={this.state.labelRowELem} containerHeight={legendRowHeight} onClick={() => { this.setState({ labelRowContracted: !this.state.labelRowContracted }) }} />
            {labelList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    const mapRelTypes = (legendItems) => {
      if (!legendItems || !Object.keys(legendItems).length) {
        return null
      }
      const relTypeList = Object.keys(legendItems).map((legendItemKey, i) => {
        const styleForItem = this.props.graphStyle.forRelationship({type: legendItemKey})
        const onClick = () => { this.props.onSelectedRelType(legendItemKey, Object.keys(legendItems[legendItemKey].properties)) }
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
        <StyledLegendRow className={this.state.typeRowContracted ? 'contracted' : ''}>
          <StyledLegendInlineList className='list-inline' ref={this.setTypeRowELem.bind(this)}>
            <RowExpandToggleComponent contracted={this.state.typeRowContracted} rowElem={this.state.typeRowElem} containerHeight={legendRowHeight} onClick={() => { this.setState({ typeRowContracted: !this.state.typeRowContracted }) }} />
            {relTypeList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    let relTypes = mapRelTypes(this.props.stats.relTypes)
    return (
      <StyledLegend className={relTypes ? '' : 'one-row'}>
        {mapLabels(this.props.stats.labels)}
        {relTypes}
      </StyledLegend>

    )
  }
}
