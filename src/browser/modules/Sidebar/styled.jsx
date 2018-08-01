/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import React from 'react'
import styled from 'styled-components'
import {
  QuestionIcon,
  PlayIcon,
  PlainPlayIcon,
  PlusIcon,
  BinIcon,
  EditIcon
} from 'browser-components/icons/Icons'

export const StyledSetting = styled.div`
  padding-bottom: 15px;
`

export const StyledSettingLabel = styled.div`
  word-wrap: break-wrap;
  display: inline-block;
`

export const StyledSettingTextInput = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

export const StyledHelpLink = styled.a``
export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 0 0 0;
`

const StyledDocumentText = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`

export const StyledDocumentActionLink = props => {
  const { name, ...rest } = props
  return (
    <StyledHelpItem onClick={props.onClick}>
      <StyledDocumentText {...rest}>
        {props.type === 'play' ? <PlayIcon /> : <QuestionIcon />}&nbsp;{name}
      </StyledDocumentText>
    </StyledHelpItem>
  )
}

export const StyledList = styled.ul`
  list-style-type: none;
  margin: 16px 0;
`
export const StyledListItem = styled.li`
  list-style-type: none;
  margin: 8px 0px 8px ${props => (props.isChild ? '16px' : '8px')};
  cursor: pointer;
`
export const StyledListHeaderItem = styled.li`
  list-style-type: none;
  cursor: pointer;
`
export const StyledFavoriteText = styled.span`
  font-family: ${props => props.theme.primaryFontFamily};
  width: 168px;
  color: #bcc0c9;
  font-size: 13px;
  display: inline-block;
  word-wrap: break-word;
  word-break: break-word;
  max-height: 54px;
  overflow: hidden;
`
export const FoldersButton = styled.button`
  background: transparent;
  border: none;
  outline: none;
  float: right;
  margin-left: 10px;
`

const NewFolderStyledButton = styled.button`
  background: transparent;
  border: none;
  float: right;
  font-size: 80%;
  outline: none;
`

export const StyledFavFolderButtonSpan = styled.span`
  float: right;
`

export const FolderButtonContainer = styled.span`
  float: right;
`

export const EditFolderInput = styled.input`
  color: black;
  border: none;
  outline: none;
  border-radius: 5px;
  line-height: 200%;
  padding-left: 5px;
`

export const StyledDropzoneText = styled.div`
  padding: 85px 0 0 15px;
  color: #666666;
`
const StyledExecFavoriteButton = styled.div`
  display: inline-block;
  opacity: 0.2;
  position: relative;
  vertical-align: top;
  margin: 1px 6px 0 0;
  &:hover {
    opacity: 1;
  }
`

export const StyledFolderLabel = styled.div`
  display: inline-block;
  max-width: 65%;
`
export const ExecFavoriteButton = props => {
  return (
    <StyledExecFavoriteButton {...props}>
      <PlainPlayIcon />
    </StyledExecFavoriteButton>
  )
}

export const NewFolderButton = props => {
  return (
    <NewFolderStyledButton onClick={props.onClick}>
      <PlusIcon />New Folder
    </NewFolderStyledButton>
  )
}

export const DeleteFavButton = props => {
  const rightIcon =
    props.removeClick && !props.isStatic ? (
      <BinIcon className={'remove'} />
    ) : null
  return (
    <StyledFavFolderButtonSpan onClick={() => props.removeClick(props.id)}>
      {rightIcon}
    </StyledFavFolderButtonSpan>
  )
}

export const EditFolderButton = props => {
  return (
    <FoldersButton onClick={props.editClick}>
      <EditIcon />
    </FoldersButton>
  )
}
