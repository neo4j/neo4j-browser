/*
 * Copyright (c) "Neo4j"
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
  StyledLegendRow,
  StyledTokenRelationshipType,
  StyledLegendInlineListItem,
  StyledLegend,
  StyledLegendContents,
  StyledLabelToken,
  StyledTokenCount,
  StyledLegendInlineList
} from './styled'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { Popup } from 'semantic-ui-react'
import { GrassEditor } from './GrassEditor'

type State = any

export class ResultsPaneComponent extends Component<any, State> {
  labelRowELem: any
  typeRowElem: any
  constructor(props: {}) {
    super(props)
    this.state = {
      typeRowContracted: true,
      labelRowContracted: true
    }
    this.typeRowElem = null
    this.labelRowELem = null
  }

  setTypeRowELem(elem: any) {
    if (elem) {
      this.typeRowElem = elem
    }
  }

  setLabelRowELem(elem: any) {
    if (elem) {
      this.labelRowELem = elem
    }
  }

  render() {
    const mapLabels = (labels: any) => {
      if (!labels || !Object.keys(labels).length) {
        return null
      }
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
              <Popup
                on="click"
                basic
                pinned
                trigger={
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
                }
                // inverted
                wide
                // position="bottom center"
              >
                <GrassEditor
                  selectedLabel={this.props.selectedLabel?.item?.selectedLabel}
                  frameHeight={this.props.frameHeight}
                />
              </Popup>
            </StyledLegendContents>
          </StyledLegendInlineListItem>
        )
      })
      return (
        <StyledLegendRow>
          <StyledLegendInlineList
            className="list-inline"
            ref={this.setLabelRowELem.bind(this)}
          >
            {labelList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    const mapRelTypes = (legendItems: any) => {
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
              <Popup
                on="click"
                basic
                pinned
                trigger={
                  <StyledTokenRelationshipType
                    onClick={onClick}
                    style={style}
                    className="token token-relationship-type"
                  >
                    {legendItemKey}
                    <StyledTokenCount className="count">
                      {`(${numberToUSLocale(
                        legendItems[legendItemKey].count
                      )})`}
                    </StyledTokenCount>
                  </StyledTokenRelationshipType>
                }
                wide
              >
                <GrassEditor
                  selectedRelType={
                    this.props.selectedLabel?.item?.selectedRelType
                  }
                  frameHeight={this.props.frameHeight}
                />
              </Popup>
            </StyledLegendContents>
          </StyledLegendInlineListItem>
        )
      })
      return (
        <StyledLegendRow>
          <StyledLegendInlineList
            className="list-inline"
            ref={this.setTypeRowELem.bind(this)}
          >
            {relTypeList}
          </StyledLegendInlineList>
        </StyledLegendRow>
      )
    }
    const relTypes = mapRelTypes(this.props.stats.relTypes)
    return (
      <StyledLegend>
        Node Labels:{' '}
        {mapLabels(this.props.stats.labels) || <div>No labels to display</div>}
        Relationship Types:{' '}
        {relTypes || <div>No relationship types to display</div>}
      </StyledLegend>
    )
  }
}
