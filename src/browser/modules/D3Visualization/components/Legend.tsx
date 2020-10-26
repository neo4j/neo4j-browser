/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import {
  legendRowHeight,
  StyledLegendRow,
  StyledTokenRelationshipType,
  StyledLegendInlineListItem,
  StyledLegend,
  StyledLegendContents,
  StyledLabelToken,
  StyledTokenCount,
  StyledLegendInlineList
} from './styled'
import { RowExpandToggleComponent } from './RowExpandToggle'
import numberToUSLocale from 'shared/utils/number-to-US-locale'

export class LegendComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.state.typeRowContracted = true
    this.state.labelRowContracted = true
    this.typeRowElem = null
    this.labelRowELem = null
  }

  setTypeRowELem(elem) {
    if (elem) {
      this.typeRowElem = elem
    }
  }

  setLabelRowELem(elem) {
    if (elem) {
      this.labelRowELem = elem
    }
  }

  render() {
    const mapLabels = labels => {
      const labelList = Object.keys(labels).map((legendItemKey, i) => {
        const styleForItem = this.props.graphStyle.forNode({
          labels: [legendItemKey]
        })
        const onClick = () => {
          this.props.onSelectedLabel(
            legendItemKey,
            Object.keys(labels[legendItemKey].properties)
          )
        }
        const style = {
          backgroundColor: styleForItem.get('color'),
          color: styleForItem.get('text-color-internal')
        }
        return (
          <StyledLegendInlineListItem key={i} data-testid="viz-legend-labels">
            <StyledLegendContents className="contents">
              <StyledLabelToken
                onClick={onClick}
                style={style}
                className="token token-label"
              >
                {legendItemKey}
                <StyledTokenCount className="count">{`(${numberToUSLocale(
                  labels[legendItemKey].count
                )})`}</StyledTokenCount>
              </StyledLabelToken>
            </StyledLegendContents>
          </StyledLegendInlineListItem>
        )
      })
      return (
        <StyledLegendRow
          className={this.state.labelRowContracted ? 'contracted' : ''}
        >
          <StyledLegendInlineList
            className="list-inline"
            ref={this.setLabelRowELem.bind(this)}
          >
            <RowExpandToggleComponent
              contracted={this.state.labelRowContracted}
              rowElem={this.labelRowELem}
              containerHeight={legendRowHeight}
              onClick={() => {
                this.setState({
                  labelRowContracted: !this.state.labelRowContracted
                })
              }}
            />
            {labelList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    const mapRelTypes = legendItems => {
      if (!legendItems || !Object.keys(legendItems).length) {
        return null
      }
      const relTypeList = Object.keys(legendItems).map((legendItemKey, i) => {
        const styleForItem = this.props.graphStyle.forRelationship({
          type: legendItemKey
        })
        const onClick = () => {
          this.props.onSelectedRelType(
            legendItemKey,
            Object.keys(legendItems[legendItemKey].properties)
          )
        }
        const style = {
          backgroundColor: styleForItem.get('color'),
          color: styleForItem.get('text-color-internal')
        }
        return (
          <StyledLegendInlineListItem key={i} data-testid="viz-legend-reltypes">
            <StyledLegendContents className="contents">
              <StyledTokenRelationshipType
                onClick={onClick}
                style={style}
                className="token token-relationship-type"
              >
                {legendItemKey}
                <StyledTokenCount className="count">
                  {`(${numberToUSLocale(legendItems[legendItemKey].count)})`}
                </StyledTokenCount>
              </StyledTokenRelationshipType>
            </StyledLegendContents>
          </StyledLegendInlineListItem>
        )
      })
      return (
        <StyledLegendRow
          className={this.state.typeRowContracted ? 'contracted' : ''}
        >
          <StyledLegendInlineList
            className="list-inline"
            ref={this.setTypeRowELem.bind(this)}
          >
            <RowExpandToggleComponent
              contracted={this.state.typeRowContracted}
              rowElem={this.typeRowElem}
              containerHeight={legendRowHeight}
              onClick={() => {
                this.setState({
                  typeRowContracted: !this.state.typeRowContracted
                })
              }}
            />
            {relTypeList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    const relTypes = mapRelTypes(this.props.stats.relTypes)
    return (
      <StyledLegend className={relTypes ? '' : 'one-row'}>
        {mapLabels(this.props.stats.labels)}
        {relTypes}
      </StyledLegend>
    )
  }
}
