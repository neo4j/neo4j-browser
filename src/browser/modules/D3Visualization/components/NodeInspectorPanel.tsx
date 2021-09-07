import React, { Component, useEffect, useRef, useState } from 'react'
import { Icon } from 'semantic-ui-react'
import {
  StyledNodeInspectorCollapsedButton,
  StyledNodeInspectorContainer,
  StyledNodeInspectorPane,
  StyledNodeInspectorTopMenu,
  StyledNodeInspectorTopMenuChevron
} from './styled'

interface NodeInspectorPanelProps {
  results: JSX.Element
  details: JSX.Element
  hoveredItem: any
  selectedItem: any
}

type NodeInspectorPanelState = any

export class NodeInspectorPanel extends Component<
  NodeInspectorPanelProps,
  NodeInspectorPanelState
> {
  constructor(props: NodeInspectorPanelProps) {
    super(props)
    this.state = {
      expanded: true,
      showResults: true,
      width: 300,
      start: null
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.selectedItem === this.props.selectedItem) {
      return
    }
    if (
      this.props.selectedItem.type === 'node' &&
      (this.props.hoveredItem.type === 'node' ||
        this.props.hoveredItem.type === 'relationship' ||
        this.props.hoveredItem.type === 'canvas') &&
      this.state.showResults
    ) {
      this.setState(() => ({
        showResults: false
      }))
    }
  }

  togglePanel = (isOpen: boolean) => {
    this.setState({
      expanded: isOpen,
      showResults: !(
        this.props.selectedItem.type === 'node' &&
        (this.props.hoveredItem.type === 'node' ||
          this.props.hoveredItem.type === 'relationship' ||
          this.props.hoveredItem.type === 'canvas')
      )
    })
  }

  render() {
    if (!this.state.expanded) {
      return (
        <StyledNodeInspectorCollapsedButton
          onClick={e => {
            e.stopPropagation()
            this.togglePanel(true)
          }}
        >
          <Icon
            title="Click to expand the Node Properties display"
            name="chevron left"
          />
        </StyledNodeInspectorCollapsedButton>
      )
    }

    console.log(this.state.width)

    return (
      <StyledNodeInspectorContainer width={this.state.width}>
        <div
          onMouseDown={e => {
            this.setState({ dragging: true, start: e.clientX })
            window.onmousemove = (event: any) => {
              if (this.state.start) {
                const mov = event.clientX
                this.setState((oldState: any) => ({
                  width: 300 - (mov - oldState.start)
                }))
              }
            }
            window.onmouseup = () => {
              this.setState({ start: null })
            }
          }}
        >
          dragger
        </div>
        <StyledNodeInspectorTopMenu>
          <StyledNodeInspectorPane
            isActive={this.state.showResults}
            onClick={e => {
              e.stopPropagation()
              this.setState(() => ({ showResults: true }))
            }}
          >
            Results
          </StyledNodeInspectorPane>
          <StyledNodeInspectorPane
            isActive={!this.state.showResults}
            onClick={e => {
              e.stopPropagation()
              this.setState(() => ({ showResults: false }))
            }}
          >
            Details
          </StyledNodeInspectorPane>
          <StyledNodeInspectorTopMenuChevron
            onClick={e => {
              e.stopPropagation()
              this.togglePanel(false)
            }}
          >
            <Icon name="chevron right" />
          </StyledNodeInspectorTopMenuChevron>
        </StyledNodeInspectorTopMenu>
        <div style={{ height: 'inherit' }}>
          {this.state.showResults ? this.props.results : this.props.details}
        </div>
      </StyledNodeInspectorContainer>
    )
  }
}
