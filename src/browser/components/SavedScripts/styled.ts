import styled from 'styled-components'

export const SavedScriptsBody = styled.div`
  padding: 0 18px;
  margin-bottom: 12px;
`

export const SavedScriptsHeader = styled.h5`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #424650;
  font-size: 16px;
  margin-bottom: 12px;
  line-height: 39px;
  position: relative;
  font-weight: bold;
`
export const FolderNameWrapper = styled.span`
  margin-left: 5px;
`

export const SavedScriptsListItemMain = styled.div<{
  isSelected?: boolean
}>`
  padding: 5px 3px;
  display: flex;
  justify-content: space-between;

  background-color: ${props =>
    props.isSelected ? props.theme.hoverBackground : 'inherit'};

  border-left: 3px solid
    ${props => (props.isSelected ? '#68BDF4' : 'transparent')};

  &:hover {
    color: inherit;
    background-color: ${props => props.theme.hoverBackground};
  }
`

export const SavedScriptsNewFavorite = styled.div`
  flex: 1;
  user-select: none;
  cursor: pointer;
  color: #bcc0c9;
  font-size: 13px;
  margin-left: 6px;
  transition: color ease-in-out 0.3s;

  &:hover {
    color: inherit;
  }
`

export const SavedScriptsListItemDisplayName = styled.div`
  flex: 1;
  user-select: none;
  cursor: pointer;
  color: #bcc0c9;
  font-size: 13px;
  padding: 1px 0;
  margin-right: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const SavedScriptsFolderMain = styled.div`
  padding-bottom: 16px;
`
export const ChildrenContainer = styled.div`
  padding-left: 10px;
`

export const SavedScriptsFolderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 5px;
`

export const SavedScriptsFolderBody = styled.div`
  margin-left: 15px;
`

export const SavedScriptsFolderLabel = styled.div`
  flex: 1;
  margin-right: 10px;
  user-select: none;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
`

export const SavedScriptsFolderCollapseIcon = styled.span`
  margin-right: 3px;
  width: 8px;
  display: inline-block;
  vertical-align: middle;
`

export const SavedScriptsButtonWrapper = styled.div`
  min-width: 21px;

  > button:not(:last-of-type) {
    margin-right: 5px;
  }
`

export const StyledSavedScriptsButton = styled.button`
  color: #bcc0c9;
  background: transparent;
  border: none;
  outline: none;
  padding: 3px;
  transition: color ease-in-out 0.3s;
  cursor: pointer;

  &:hover {
    color: inherit;
  }
`

export const SavedScriptsInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-weight: normal;
  margin-right: 5px;
`

export const ContextMenuContainer = styled.span`
  position: relative;
`

export const ContextMenuHoverParent = styled.span<{ stayVisible?: boolean }>`
  ${ContextMenuContainer} {
    visibility: ${props => (props.stayVisible ? 'visible' : 'hidden')};
  }

  &:hover ${ContextMenuContainer} {
    visibility: visible;
  }
`

export const ContextMenu = styled.div`
  color: ${props => props.theme.primaryText};
  padding-top: 5px;
  padding-bottom: 5px;
  position: absolute;
  width: 156px;
  left: -156px;
  top: -3px;
  z-index: 999;
  border: 1px solid transparent;
  background-color: ${props => props.theme.secondaryBackground};
  border: ${props => props.theme.frameBorder};

  box-shadow: 0px 0px 2px rgba(52, 58, 67, 0.1),
    0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);
  border-radius: 2px;
`
export const ContextMenuItem = styled.div`
  cursor: pointer;
  width: 100%;
  padding-left: 5px;

  &:hover {
    background-color: ${props => props.theme.primaryBackground};
  }
`

export const Separator = styled.div`
  border-bottom: 1px solid rgb(77, 74, 87, 0.3);
`
