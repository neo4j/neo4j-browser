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

interface NodeInspectorPanelProps {
  hoveredItem: any
  selectedItem: any
  stats: any
  graphStyle: any
  onSelectedLabel: any
  onSelectedRelType: any
  selectedLabel: any
  frameHeight: number
  hasTruncatedFields: any
  fullscreen: any
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
          {this.state.showResults ? (
            <ResultsPane
              stats={this.props.stats}
              graphStyle={this.props.graphStyle}
              onSelectedLabel={this.props.onSelectedLabel}
              onSelectedRelType={this.props.onSelectedRelType}
              selectedLabel={this.props.selectedLabel}
              frameHeight={this.props.frameHeight}
              hasTruncatedFields={this.props.hasTruncatedFields}
              fullscreen={this.props.fullscreen}
              hoveredItem={this.props.hoveredItem}
              selectedItem={this.props.selectedItem}
            />
          ) : (
            <DetailsPaneComponent
              hasTruncatedFields={this.props.hasTruncatedFields}
              fullscreen={this.props.fullscreen}
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
