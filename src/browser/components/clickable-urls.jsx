/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react'
import { HTMLEntities } from 'services/santize.utils'

export default function ClickableUrls({ text }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: convertUrlsToHrefTags(HTMLEntities(text))
      }}
    />
  )
}

// credits to https://www.regextester.com/96504
const URL_REGEX = /(([a-zA-Z]+):\/\/)(?:(?:[^\s()<>"]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))?/gi

/**
 * Finds all urls in a string and wraps them in <a target="_blank" />
 * @param     {string}    text
 * @return    {string}
 */
export function convertUrlsToHrefTags(text) {
  return `${text || ''}`.replace(
    URL_REGEX,
    match => `<a href="${match}" target="_blank">${match}</a>`
  )
}
