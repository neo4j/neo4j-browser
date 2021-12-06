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
import { connect } from 'react-redux'
import neoGraphStyle from '../graphStyle'
import {
  StyledPickerSelector,
  StyledTokenRelationshipType,
  StyledInlineList,
  StyledInlineListItem,
  StyledLabelToken,
  StyledPickerListItem,
  StyledCircleSelector,
  StyledCaptionSelector,
  StyledInlineListStylePicker
} from './styled'
import * as actions from 'shared/modules/grass/grassDuck'
import { toKeyString } from 'shared/services/utils'
import { GraphStyle } from './OverviewPane'
import { GlobalState } from 'shared/globalState'
import { Action, Dispatch } from 'redux'

type GrassEditorProps = {
  graphStyleData?: any
  graphStyle?: GraphStyle
  update?: any
  selectedLabel?: { label: string; propertyKeys: string[] }
  selectedRelType?: { relType: string; propertyKeys: string[] }
  frameHeight: number
}

export class GrassEditorComponent extends Component<GrassEditorProps> {
  graphStyle: any
  nodeDisplaySizes: any
  picker: any
  widths: any
  constructor(props: any) {
    super(props)
    this.graphStyle = neoGraphStyle()
    if (this.props.graphStyleData) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
    this.nodeDisplaySizes = []
    this.widths = []
    for (let index = 0; index < 10; index++) {
      this.nodeDisplaySizes.push(`${12 + 2 * index}px`)
      this.widths.push(`${5 + 3 * index}px`)
    }
  }

  sizeLessThan(size1: any, size2: any) {
    const size1Numerical = size1 ? size1.replace('px', '') + 0 : 0
    const size2Numerical = size1 ? size2.replace('px', '') + 0 : 0
    return size1Numerical <= size2Numerical
  }

  updateStyle(selector: any, styleProp: any) {
    this.graphStyle.changeForSelector(selector, styleProp)
    this.props.update(this.graphStyle.toSheet())
  }

  circleSelector(
    type: 'color' | 'size',
    styleProps: any,
    styleProvider: any,
    activeProvider: any,
    className: any,
    selector: any,
    textProvider = (_: any) => {
      return ''
    }
  ) {
    return styleProps.map((styleProp: any, i: any) => {
      const onClick = () => {
        this.updateStyle(selector, styleProp)
      }
      const style = styleProvider(styleProp, i)
      const text = textProvider(styleProp)
      const active = activeProvider(styleProp)
      return (
        <StyledPickerListItem
          className={className}
          key={toKeyString('circle' + i)}
          data-testid={`select-${type}-${i}`}
        >
          <StyledCircleSelector
            className={active ? 'active' : ''}
            style={style}
            onClick={onClick}
          >
            {text}
          </StyledCircleSelector>
        </StyledPickerListItem>
      )
    })
  }

  colorPicker(selector: any, styleForLabel: any) {
    return (
      <StyledInlineListItem key="color-picker">
        <StyledInlineList>
          <StyledInlineListItem>Color:</StyledInlineListItem>
          {this.circleSelector(
            'color',
            this.graphStyle.defaultColors(),
            (color: any) => {
              return { backgroundColor: color.color }
            },
            (color: any) => {
              return color.color === styleForLabel.get('color')
            },
            'color-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  sizePicker(selector: any, styleForLabel: any) {
    return (
      <StyledInlineListItem key="size-picker">
        <StyledInlineList data-testid="size-picker">
          <StyledInlineListItem>Size:</StyledInlineListItem>
          {this.circleSelector(
            'size',
            this.graphStyle.defaultSizes(),
            (_size: any, index: any) => {
              return {
                width: this.nodeDisplaySizes[index],
                height: this.nodeDisplaySizes[index]
              }
            },
            (size: any) => {
              return this.sizeLessThan(
                size.diameter,
                styleForLabel.get('diameter')
              )
            },
            'size-picker-item',
            selector
          )}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  widthPicker(selector: any, styleForItem: any) {
    const widthSelectors = this.graphStyle
      .defaultArrayWidths()
      .map((widthValue: any, i: any) => {
        const onClick = () => {
          this.updateStyle(selector, widthValue)
        }
        const style = { width: this.widths[i] }
        const active =
          styleForItem.get('shaft-width') === widthValue['shaft-width']
        return (
          <StyledPickerListItem key={toKeyString('width' + i)}>
            <StyledPickerSelector
              className={active ? 'active' : ''}
              style={style}
              onClick={onClick}
            />
          </StyledPickerListItem>
        )
      })
    return (
      <StyledInlineListItem key="width-picker">
        <StyledInlineList>
          <StyledInlineListItem>Line width:</StyledInlineListItem>
          {widthSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  iconPicker(selector: any) {
    return (
      <li key="icon-picker">
        Icon:
        <ul>
          {this.picker(
            this.graphStyle.defaultIconCodes(),
            () => {
              return { fontFamily: 'streamline' }
            },
            'icon-picker-item',
            selector,
            (iconCode: any) => {
              return iconCode['icon-code']
            }
          )}
        </ul>
      </li>
    )
  }

  captionPicker(
    selector: any,
    styleForItem: any,
    propertyKeys: any,
    showTypeSelector = false
  ) {
    const captionSelector = (displayCaption: string, captionToSave: string) => {
      const onClick = () => {
        this.updateStyle(selector, { caption: captionToSave })
      }
      const active = styleForItem.props.caption === captionToSave
      return (
        <StyledPickerListItem key={toKeyString('caption' + displayCaption)}>
          <StyledCaptionSelector
            className={active ? 'active' : ''}
            onClick={onClick}
          >
            {displayCaption}
          </StyledCaptionSelector>
        </StyledPickerListItem>
      )
    }
    const captionSelectors = propertyKeys.map((propKey: any) => {
      return captionSelector(propKey, `{${propKey}}`)
    })
    let typeCaptionSelector = null
    if (showTypeSelector) {
      typeCaptionSelector = captionSelector('<type>', '<type>')
    }
    return (
      <StyledInlineListItem key="caption-picker">
        <StyledInlineList>
          <StyledInlineListItem>Caption:</StyledInlineListItem>
          {captionSelector('<id>', '<id>')}
          {typeCaptionSelector}
          {captionSelectors}
        </StyledInlineList>
      </StyledInlineListItem>
    )
  }

  stylePicker() {
    let pickers
    let title
    if (this.props.selectedLabel) {
      const labelList =
        this.props.selectedLabel.label !== '*'
          ? [this.props.selectedLabel.label]
          : []
      const styleForLabel = this.graphStyle.forNode({ labels: labelList })
      const inlineStyle = {
        backgroundColor: styleForLabel.get('color'),
        color: styleForLabel.get('text-color-internal'),
        cursor: 'default'
      }
      pickers = [
        this.colorPicker(styleForLabel.selector, styleForLabel),
        this.sizePicker(styleForLabel.selector, styleForLabel),
        this.captionPicker(
          styleForLabel.selector,
          styleForLabel,
          this.props.selectedLabel.propertyKeys
        )
      ]
      title = (
        <StyledLabelToken style={inlineStyle}>
          {this.props.selectedLabel.label || '*'}
        </StyledLabelToken>
      )
    } else if (this.props.selectedRelType) {
      const relTypeSelector =
        this.props.selectedRelType.relType !== '*'
          ? { type: this.props.selectedRelType.relType }
          : {}
      const styleForRelType = this.graphStyle.forRelationship(relTypeSelector)
      const inlineStyle = {
        backgroundColor: styleForRelType.get('color'),
        color: styleForRelType.get('text-color-internal'),
        cursor: 'default'
      }
      pickers = [
        this.colorPicker(styleForRelType.selector, styleForRelType),
        this.widthPicker(styleForRelType.selector, styleForRelType),
        this.captionPicker(
          styleForRelType.selector,
          styleForRelType,
          this.props.selectedRelType.propertyKeys,
          true
        )
      ]
      title = (
        <StyledTokenRelationshipType style={inlineStyle}>
          {this.props.selectedRelType.relType || '*'}
        </StyledTokenRelationshipType>
      )
    } else {
      return null
    }
    return (
      <StyledInlineListStylePicker frameHeight={this.props.frameHeight}>
        {title}
        {pickers}
      </StyledInlineListStylePicker>
    )
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.graphStyleData &&
      prevProps.graphStyleData !== this.props.graphStyleData
    ) {
      this.graphStyle.loadRules(this.props.graphStyleData)
    }
  }

  render() {
    return this.stylePicker()
  }
}
const mapStateToProps = (state: GlobalState) => ({
  graphStyleData: actions.getGraphStyleData(state),
  meta: state.meta
})

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  update: (data: any) => {
    dispatch(actions.updateGraphStyleData(data))
  }
})

export const GrassEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(GrassEditorComponent)
