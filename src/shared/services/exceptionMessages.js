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

export const AddServerValidationError =
  'Wrong format. It should be ":server add name username:password@host:port"'
export const CreateDataSourceValidationError =
  'Wrong format. It should be ":datasource create {"name": "myName", "command": "RETURN rand()", "bookmarkId":"uuid-of-existing-bookmark", "refreshInterval": 10, "parameters": {}}"'
export const RemoveDataSourceValidationError =
  'Wrong format. It should be ":datasource remove uuid-of-existing-datasource"'
export const BoltConnectionError =
  'No connection found, did you connect to Neo4j?'
export const BoltError = '#code# - #message#'
export const Neo4jError = '#message#'
export const UnknownCommandError = 'Unknown command #cmd#'
export const BookmarkNotFoundError =
  'No connection with the name #name# found. Add a bookmark before trying to connect.'
export const OpenConnectionNotFoundError =
  'No open connection with the name #name# found. You have to connect to a bookmark before you can use it.'
export const CouldNotFetchRemoteGuideError =
  'Can not fetch remote guide: #error#'
export const FetchURLError =
  'Could not fetch URL: "#error#". This could be due to the remote server policy. See your web browsers error console for more information.'
