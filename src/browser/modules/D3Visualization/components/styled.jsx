import styled from 'styled-components'

export const StyledSvgWrapper = styled.div`
  line-height: 0;
  > svg {
  height: 247px;
  width: 100%;
  background-color: #f9fbfd;
    .node {
      cursor: pointer;
      > .ring {
        fill: none;
        opacity: 0;
        stroke: #6ac6ff;
      }
      &.selected {
        > .ring {
          stroke: #fdcc59;
          opacity: 0.3;
        }
      }
      &:hover {
        > .ring {
          stroke: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .relationship {
      > .overlay {
        opacity: 0;
        fill: #6ac6ff;
      }
      &.selected {
        > .overlay {
          fill: #fdcc59;
          opacity: 0.3;
        }
      }
      &:hover {
        > .overlay {
          fill: #6ac6ff;
          opacity: 0.3;
        }
      }
    }
    .remove_node {
      .expand_node {
        &:hover {
          border: 2px #000 solid;
        }
      }
    }
    .outline {
      cursor: pointer
    }
    path {
      &.context-menu-item {
        stroke-width: 2px;
        fill: #d2d5da;
      }
    }
    text {
      &.context-menu-item {
        fill: #fff;
        text-anchor: middle;
        pointer-events: none;
        font-size: 14px;
      }
    }
    .context-menu-item {
      cursor: pointer;
      &:hover {
        fill: #b9b9b9;
        font-size: 14px;
      }
    }
  }
  &.one-legend-row {
    > svg {
    height: 279px;
  }
`
export const StyledStream = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  margin-top: 17px;
`

export const p = styled.div`
  margin-top: 6px;
  font-size: 12px;
  width: 100%;
  white-space: normal;
`

export const styledRowToggle = styled.div`
  float: right;
  display: block;
  width: 21px;
  height: 21px;
  line-height: 21px;
  text-align: center;
  cursor: pointer;
  display: none;
`

export const StyledInspectorFooter = styled.div`
  line-height: 21px;
`

export const StyledInspectorFooterRow = styled.ul`
  list-style: none;
  word-break: break-word;
  margin-top: -3px;
  line-height: 21px;
  margin-top: 3px;
`

export const StyledInspectorFooterRowListKey = styled.div`
  float: left;
  font-weight: 800;
`

export const StyledInspectorFooterRowListValue = styled.div`
  padding-left: 3px;
  overflow: hidden;
  float: left;
  white-space: pre-wrap;
`

export const StyledInlineList = styled.ul`
  padding-left: 0;
  margin-left: -5px;
  list-style: none;
`

export const StyledInlineListItem = styled.li`
  display: inline-block;
  padding-right: 5px;
  padding-left: 5px;
`

export const StyledStatusBarWrapper = styled.div`
  height: 68px;
  display: none;
`
export const StyledStatusBar = styled.div`
  min-height: 39px;
  line-height:  39px;
  color: #788185;
  font-size: 13px;
  position: relative;
  background-color: #fff;
  white-space: nowrap;
  overflow: hidden;
  border-top: 1px solid #e6e9ef;
`

// .status-bar .btn-group {
//   absolute: top 3px right 12px;
// }
// .status-bar .icon-warning-sign {
//   font-size: 18px;
// }
export const StyledStatus = styled.div`
  position: relative;
  float: left;
  padding-left: 16px;
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
  margin-top: 3px;
`

export const StyledInspectorFooterRowListPair = styled(StyledInlineListItem)`
  vertical-align: middle;
  font-size: 13px;
`

export const StyledToken = styled(StyledInlineListItem)`
  display: inline-block;
  font-weight: bold;
  line-height: 1em;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
`
export const StyledLabelToken = styled(StyledToken)`
  padding: 4px 7px 4px 9px;
  border-radius: 20px;
`
export const StyledTokenRelationshipType = styled(StyledToken)`
  padding: 4px 7px 4px 5px;
  border-radius: 3px;
`

export const tokenPropertyKey = styled(StyledToken)`
  padding: 3px 5px 3px 5px;
`
export const StyledTokenContextMenuKey = styled(StyledLabelToken)` {
  color: #f9fbfd;
  background-color: #d2d5da;
  font-family: FontAwesome;
  padding: 4px 9px;
`

export const StyledTokenCount = styled.span`
  font-weight: normal;
`
export const StyledLegendContents = styled.div`
  float: left;
  line-height: 1em;
  position: relative;
  top: 3px;
  top: -1px;
`

export const StyledLegendRow = styled.div`
  border-bottom: 1px solid #e6e9ef;
  max-height: 32px;
  overflow: hidden;
`

export const StyledLegend = styled.div`
  background-color: #eef1f8;
`
export const StyledLegendInlineList = styled(StyledInlineList) `
  padding: 7px 9px 0px 10px;
`
export const StyledLegendInlineListItem = styled(StyledInlineListItem) `
  display: inline-block;
  margin-bottom: 3px;
`
export const StyledPickerListItem = styled(StyledInlineListItem)`
  padding-right: 5px;
  padding-left: 0;
  vertical-align: middle;
`

export const StyledPickerSelector = styled.a`
  background-color: #aaa;
  display: inline-block;
  height: 12px;
  width: 12px;
  margin-top: 1px;
  line-height: 0;
  cursor: pointer;
  opacity: 0.4;
  &:hover {
   opacity: 1;
  }
  &.active {
    opacity: 1;
  }
`
export const StyledCircleSelector = styled(StyledPickerSelector)`
   border-radius: 50%;
`
export const StyledCaptionSelector = styled.a`
  cursor: pointer;
  user-select: none;
  display: inline-block;
  padding: 1px 6px;
  font-size: 12px;
  line-height: 12px;
  color: #9195A0;
  border: 1px solid #9195A0;
  overflow: hidden;
  border-radius: .25em;
  margin-right: 0;
  font-weight: bold;
  &:hover {
    border-color: #aaa;
    color: #aaa;
    text-decoration: none;
  }
  &.active {
    color: white;
    background-color: #9195A0;
  }
`
