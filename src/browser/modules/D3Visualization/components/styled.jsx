import styled, { keyframes } from 'styled-components'
import { dim } from 'browser-styles/constants'

export const StyledSvgWrapper = styled.div`
  > svg {
  height: 240px;
  width: 100%;
  background-color: #f9fbfd;
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

export const StyledLegend = styled.div`
  display: table-row;
`
export const StyledLegendInlineList = styled(StyledInlineList) `
  padding: 7px 9px 0px 10px;
`
export const StyledLegendInlineListItem = styled(StyledInlineListItem) `
  display: inline-block;
  margin-bottom: 3px;
`

// .status-bar .status,
// .status-bar .status .inspector-footer-row {
//   margin-top: 3px;
// }
// .status-bar .status .status-bar-actions {
//   absolute: right 0px;
//   top: -1px;
// }
// .status-bar .status p {
//   line-height: 36px;
//   margin: 0;
// }
//
// .legend {
//   display: table-row;
// }
//
//
//
// .legend ul {
//   padding: 7px 9px 0px 10px;
// }
// .legend ul > li {
//   display: inline-block;
//   margin-bottom: 3px;
// }
//

//
// .grass-editor {
//   flex: 0 0 auto;
//   display: flex;
//   flex-direction: column;
//   background-color: #D2D5DA;
//   min-width: 0;
// }
//
// .grass-editor-card {
//   margin: 10px;
//   background-color: #fff;
//   border: 1px solid black;
//   padding: 10px;
// }
//
// .grass-editor-card svg {
// 	width: 100%;
//   height: 432px;
//   background-color: #eaeaea;
// 	display: inline-block;
// }
//
// .grass-editor-card .editor {
//   height: 432px;
//   width: 75%;
// 	display: inline-block;
// }
//
// .grass-editor-card .style-picker {
// 	float: left;
// }
//
// .grass-editor-card .style-picker ul {
// 	list-style: none;
// }
//
// .grass-editor-card .picker li {
// 	list-style: none;
// 	display: inline;
// 	padding-left: 1px;
// }
//
// .exampleVisualization {
// 	float: left;
//   width: 25%;
// }
// .picker li a {
// 	background-color: #aaa;
// 	display: inline-block;
// 	height: 24px;
// 	width: 24px;
// 	margin-top: 1px;
// 	line-height: 0;
// 	opacity: 0.4;
// }
//
// .color-picker li {
// 	padding-right: 5px;
// }
//
// .color-picker li a {
// border-radius: 50%;
// }
//
// .icon-picker li a {
// 	background: #fff;
// 	font-size: 24px;
// 	line-height: 24px;
// }
// .size-picker li {
// 	border-radius: 5px;
// }
//
// .size-picker li a {
// 	border-radius: 50%;
// }
//
// .width-picker li {
// 	padding-right: 5px;
// }
