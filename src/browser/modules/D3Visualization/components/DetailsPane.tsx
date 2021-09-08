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
import { deepEquals, optionalToString } from 'services/utils'
import {
  StyledTokenRelationshipType,
  StyledLabelToken,
  StyledInspectorFooterRow,
  StyledInspectorFooterRowListPair,
  StyledInspectorFooterRowListKey,
  StyledInspectorFooterRowListValue,
  StyledInlineList,
  StyledDetailsStatusBar,
  StyledDetailsStatus,
  StyledDetailsStatusContents,
  StyledInspectorFooterRowListPairAlternatingRows,
  StyledInspectorClipboardCopyAll,
  StyledInspectorFooterRowListKeyValuePair
} from './styled'
import ClickableUrls from '../../../components/ClickableUrls'
import numberToUSLocale from 'shared/utils/number-to-US-locale'
import { StyledTruncatedMessage } from 'browser/modules/Stream/styled'
import { Icon, Popup } from 'semantic-ui-react'
import ClipboardCopier from 'browser-components/ClipboardCopier'

const GraphItemProperties = ({
  id,
  properties
}: Pick<GraphVizItem, 'id' | 'properties'>) => {
  if (!properties.length) {
    return <div>No properties to display</div>
  }

  const allItemProperties = [
    { key: '<id>', value: `${id}` }, // TODO does it always have an ID?
    ...properties
  ].sort((a, b) => (a.key < b.key ? -1 : 1))

  return (
    <>
      <StyledInspectorClipboardCopyAll>
        <div style={{ marginLeft: 'auto', marginRight: '5px' }}>
          <ClipboardCopier
            textToCopy={allItemProperties.join('\n')}
            iconSize={10}
            titleText={'Copy all properties to clipboard'}
          />
        </div>
      </StyledInspectorClipboardCopyAll>
      {allItemProperties.map((prop: any, i: number) => (
        <StyledInspectorFooterRowListPairAlternatingRows
          className="pair"
          key={'prop' + i}
          isFirstOrEvenRow={(i + 1) % 2 === 0}
        >
          <Popup
            on="hover"
            basic
            wide
            trigger={
              <StyledInspectorFooterRowListKeyValuePair>
                <StyledInspectorFooterRowListKey className="key">
                  {prop.key + ': '}
                </StyledInspectorFooterRowListKey>
                <StyledInspectorFooterRowListValue className="value">
                  <ClickableUrls text={optionalToString(prop.value)} />
                </StyledInspectorFooterRowListValue>
              </StyledInspectorFooterRowListKeyValuePair>
            }
            mouseEnterDelay={1000}
            hoverable
            // hideOnScroll
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: 'scrollParent'
              }
            }}
          >
            Type: {typeof prop.value}
          </Popup>

          <div style={{ marginLeft: 'auto' }}>
            <ClipboardCopier
              textToCopy={`${prop.key}: ${prop.value}`}
              iconSize={10}
            />
          </div>
        </StyledInspectorFooterRowListPairAlternatingRows>
      ))}
    </>
  )
}

function Labels({ graphStyle, labels }: any) {
  return labels.map((label: any, index: number) => {
    const graphStyleForLabel = graphStyle.forNode({ labels: [label] })
    const style = {
      backgroundColor: graphStyleForLabel.get('color'),
      color: graphStyleForLabel.get('text-color-internal'),
      cursor: 'default'
    }
    return (
      <StyledLabelToken
        key={'label' + index}
        style={style}
        className={'token' + ' ' + 'token-label'}
      >
        {label}
      </StyledLabelToken>
    )
  })
}

type GraphVizItem = {
  type: 'canvas' | 'node' | 'relationship'
  id: number
  properties: any
}
type DetailsPaneComponentState = { contracted: boolean }
type DetailsPaneComponentProps = {
  hasTruncatedFields: boolean
  fullscreen: boolean
  hoveredItem: any
  selectedItem: any
  graphStyle: any
  onExpandToggled: (a: boolean, b: number) => void
}

export class DetailsPaneComponent extends Component<
  DetailsPaneComponentProps,
  DetailsPaneComponentState
> {
  footerRowElem: any
  constructor(props: any) {
    super(props)
    this.state = {
      contracted: true
    }
  }

  setFooterRowELem(elem: any) {
    if (elem) {
      this.footerRowElem = elem
    }
  }

  render() {
    let item = this.props.selectedItem.item
    let type = this.props.selectedItem.type

    if (item && (type === 'node' || type === 'relationship')) {
      if (
        this.props.hoveredItem &&
        (this.props.hoveredItem.type === 'node' ||
          this.props.hoveredItem.type === 'relationship')
      ) {
        item = this.props.hoveredItem.item
        type = this.props.hoveredItem.type
      }
    } else if (!item && this.props.hoveredItem.type === 'canvas') {
      item = this.props.hoveredItem.item
      type = this.props.hoveredItem.type
    }

    return (
      <StyledDetailsStatusBar className="status-bar">
        <StyledDetailsStatus className="status">
          <StyledDetailsStatusContents className="inspector-footer">
            <StyledInspectorFooterRow
              data-testid="vizInspector"
              className="inspector-footer-row"
              ref={this.setFooterRowELem.bind(this)}
            >
              {type === 'canvas' && (
                <StyledInlineList className="list-inline">
                  <StyledInspectorFooterRowListPair className="pair" key="pair">
                    <StyledInspectorFooterRowListValue className="value">
                      {this.props.hasTruncatedFields && (
                        <StyledTruncatedMessage>
                          <Icon name="warning sign" /> Record fields have been
                          truncated.&nbsp;
                        </StyledTruncatedMessage>
                      )}
                      {`Displaying ${numberToUSLocale(
                        item.nodeCount
                      )} nodes, ${numberToUSLocale(
                        item.relationshipCount
                      )} relationships.`}
                    </StyledInspectorFooterRowListValue>
                  </StyledInspectorFooterRowListPair>
                </StyledInlineList>
              )}

              {type === 'node' && (
                <StyledInlineList className="list-inline">
                  <Labels
                    labels={item.labels}
                    graphStyle={this.props.graphStyle}
                  />
                  <GraphItemProperties
                    id={item.id}
                    properties={item.properties}
                  />
                </StyledInlineList>
              )}

              {type === 'relationship' && (
                <StyledInlineList className="list-inline">
                  <StyledTokenRelationshipType
                    key="token"
                    style={{
                      backgroundColor: this.props.graphStyle
                        .forRelationship(item)
                        .get('color'),
                      color: this.props.graphStyle
                        .forRelationship(item)
                        .get('text-color-internal'),
                      cursor: 'default'
                    }}
                    className={'token' + ' ' + 'token-relationship-type'}
                  >
                    {item.type}
                  </StyledTokenRelationshipType>
                  <GraphItemProperties
                    id={item.id}
                    properties={item.properties}
                  />
                </StyledInlineList>
              )}
            </StyledInspectorFooterRow>
          </StyledDetailsStatusContents>
        </StyledDetailsStatus>
      </StyledDetailsStatusBar>
    )
  }

  toggleExpand() {
    this.setState({ contracted: !this.state.contracted }, () => {
      const detailsPaneHeight = this.footerRowElem.clientHeight
      this.props.onExpandToggled &&
        this.props.onExpandToggled(
          this.state.contracted,
          this.state.contracted ? 0 : detailsPaneHeight
        )
    })
  }

  componentDidUpdate(prevProps: any) {
    if (!deepEquals(this.props.selectedItem, prevProps.selectedItem)) {
      this.setState({ contracted: true })
      this.props.onExpandToggled && this.props.onExpandToggled(true, 0)
    }
  }
}
