import React, { Component } from 'react'
import { Icon, SemanticICONS, Popup } from 'semantic-ui-react'
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
      showResults: true
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

    return (
      <StyledNodeInspectorContainer
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
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
