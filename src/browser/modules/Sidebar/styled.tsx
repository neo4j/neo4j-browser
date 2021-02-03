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
import styled from 'styled-components'

export const StyledSetting = styled.div`
  padding-bottom: 15px;
`

export const StyledSettingLabel = styled.label`
  word-wrap: break-wrap;
  display: inline-block;
`
export const StyledErrorListContainer = styled.div`
  margin-left: 24px;
  color: #ffaf00;
`

export const StyledSettingTextInput: any = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

export const StyledHelpLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  color: #68bdf4;

  &:active {
    text-decoration: none;
  }

  &:before {
    display: inline-block;
    content: ' ';
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'> <path d='M14.3524 4.42834L2.53033 16.2504C2.23744 16.5433 1.76256 16.5433 1.46967 16.2504C1.17678 15.9575 1.17678 15.4826 1.46967 15.1897L13.2917 3.36768H2.74941C2.3352 3.36768 1.99941 3.03189 1.99941 2.61768C1.99941 2.20346 2.3352 1.86768 2.74941 1.86768H15.1022H15.1024C15.204 1.86768 15.301 1.88792 15.3894 1.92458C15.4759 1.96035 15.557 2.01298 15.6278 2.08247C15.6311 2.08571 15.6343 2.08897 15.6376 2.09226C15.707 2.16302 15.7597 2.24414 15.7954 2.33059C15.8321 2.41902 15.8524 2.51598 15.8524 2.61768V14.9706C15.8524 15.3848 15.5166 15.7206 15.1024 15.7206C14.6881 15.7206 14.3524 15.3848 14.3524 14.9706V4.42834Z' fill='%2368BDF4'/></svg>");
    height: 12px;
    width: 12px;
    margin-right: 7px;
  }
`
export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 24px 0 24px;
`

export const StyledCommandListItem = styled.li`
  list-style-type: none;
  cursor: pointer;
  -webkit-text-decoration: none;
  position: relative;

  &:hover {
    background-color: ${props => props.theme.hoverBackground};

    &:after {
      content: ' ';
      position: absolute;
      top: 15px;
      right: 5px;
      background-image: url("data:image/svg+xml;utf8,<svg fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M12.7791 6.65634C13.3966 7.04929 13.3966 7.95071 12.7791 8.34366L4.64174 13.522C3.97601 13.9456 3.10486 13.4674 3.10486 12.6783L3.10486 2.32167C3.10486 1.53258 3.97601 1.05437 4.64173 1.47801L12.7791 6.65634Z'  stroke='%2368BDF4' stroke-linejoin='round' /></svg>");
      height: 15px;
      width: 15px;
    }
  }
`

export const StyledCommandNamePair = styled.div`
  margin: 0px 24px;
  padding: 10px 0;
  display: flex;
`
export const StyledName = styled.div`
  width: 50%;
  margin-right: 5%;
`

export const StyledCommand = styled.div`
  background-color: #2a2c33;
  border-radius: 2px;
  padding: 3px;

  color: #e36962;
  font-family: Fira Code;

  overflow: hidden;
  white-space: nowrap
  text-overflow: ellipsis;

  max-width: 45%;
`
