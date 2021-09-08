import React, { useState, Component } from 'react'
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
import styled from 'styled-components'

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
}

const Container = styled.div<{ width: number }>`
  right: 0;
  position: absolute;
  top: 0;
  z-index: 1;
  background: white;
  height: 100%;
  width: ${props => props.width}px;
`

type ResizeableContainerProps = {
  side: 'LEFT' | 'RIGHT'
  initialWidth: number
  children: React.ReactNode
}
type ResizeableContainerState = {
  width: number
  dragStart: number
}
class ResizeableContainer extends React.Component<
  ResizeableContainerProps,
  ResizeableContainerState
> {
  state = { width: this.props.initialWidth, dragStart: -1 }

  render() {
    return (
      <Container width={this.state.width}>
        <div
          onMouseDown={e => {
            this.setState({ dragStart: e.clientX })
            window.onmousemove = (event: any) => {
              requestAnimationFrame(() => {
                // TODO Remove mousehandler when t
                // TODO icon
                // TODO make it work better

                const mov = event.clientX
                this.setState(oldState => ({
                  width: this.props.initialWidth - (mov - oldState.dragStart)
                }))
              })
            }

            window.onmouseup = () => {
              this.setState({ dragStart: -1 })

              window.onmousemove = () => {
                /* no-op */
              }
            }
          }}
        >
          dragger
        </div>
        {this.props.children}
      </Container>
    )
  }
}

type NodeInspectorPanelState = {
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
      <ResizeableContainer initialWidth={300} side="LEFT">
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
            {this.state.showResults ? (
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
      </ResizeableContainer>
    )
  }
}
