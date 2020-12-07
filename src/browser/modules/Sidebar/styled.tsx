/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
  &:hover:before {
    display: inline-block;
    content: ' ';
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'> <path d='M14.3524 4.42834L2.53033 16.2504C2.23744 16.5433 1.76256 16.5433 1.46967 16.2504C1.17678 15.9575 1.17678 15.4826 1.46967 15.1897L13.2917 3.36768H2.74941C2.3352 3.36768 1.99941 3.03189 1.99941 2.61768C1.99941 2.20346 2.3352 1.86768 2.74941 1.86768H15.1022H15.1024C15.204 1.86768 15.301 1.88792 15.3894 1.92458C15.4759 1.96035 15.557 2.01298 15.6278 2.08247C15.6311 2.08571 15.6343 2.08897 15.6376 2.09226C15.707 2.16302 15.7597 2.24414 15.7954 2.33059C15.8321 2.41902 15.8524 2.51598 15.8524 2.61768V14.9706C15.8524 15.3848 15.5166 15.7206 15.1024 15.7206C14.6881 15.7206 14.3524 15.3848 14.3524 14.9706V4.42834Z' fill='%2368BDF4'/></svg>");
    height: 12px;
    width: 12px;
    margin-left: -14px;
    margin-right: 2px;
  }
`
export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 0 0 0;
`

export const StyledDocumentText = styled.a`
  cursor: pointer;
  -webkit-text-decoration: none;
  text-decoration: none;
  color: #5ca6d9;

  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`
