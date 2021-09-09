import React, { Component } from 'react'
import { Icon } from 'semantic-ui-react'
import { DetailsPaneComponent } from './DetailsPane'
import ResultsPane from './ResultsPane'
import {
  StyledNodeInspectorCollapsedButton,
  StyledNodeInspectorContainer,
  StyledNodeInspectorPane,
  StyledNodeInspectorTopMenu,
  StyledNodeInspectorTopMenuChevron
} from './styled'
import { VizItem } from './types'

interface NodeInspectorPanelProps {
  hoveredItem: VizItem
  selectedItem: VizItem
  stats: any
  graphStyle: any
  onSelectedLabel: any
  onSelectedRelType: any
  selectedLabel: any
  frameHeight: number
  hasTruncatedFields: boolean
}

export type NodeInspectorPanelState = {
  expanded: boolean
  showResults: boolean
}
export class NodeInspectorPanel extends Component<
  NodeInspectorPanelProps,
  NodeInspectorPanelState
> {
  state = {
    expanded: true,
    showResults: true
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
      <StyledNodeInspectorContainer>
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
          {this.state.showResults &&
          !['node', 'relationship'].includes(this.props.hoveredItem.type) ? (
            <ResultsPane
              stats={this.props.stats}
              graphStyle={this.props.graphStyle}
              onSelectedLabel={this.props.onSelectedLabel}
              onSelectedRelType={this.props.onSelectedRelType}
              selectedLabel={this.props.selectedLabel}
              frameHeight={this.props.frameHeight}
            />
          ) : (
            <DetailsPaneComponent
              hasTruncatedFields={this.props.hasTruncatedFields}
              hoveredItem={this.props.hoveredItem}
              selectedItem={this.props.selectedItem}
              graphStyle={this.props.graphStyle}
            />
          )}
        </div>
      </StyledNodeInspectorContainer>
    )
  }
}
