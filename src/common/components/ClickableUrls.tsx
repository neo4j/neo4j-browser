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
import React from 'react'

// credits to https://www.regextester.com/96504, modified though
const URL_REGEX =
  /(?:https?|s?ftp|bolt):\/\/(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))?/gi

interface ClickableUrlsProps {
  text?: string | null
  WrappingTag?: keyof JSX.IntrinsicElements | React.ElementType
}

export function ClickableUrls({
  text,
  WrappingTag = 'span'
}: ClickableUrlsProps): JSX.Element {
  const definedText = text || ''
  const urls = definedText.match(URL_REGEX) || []
  return (
    <WrappingTag>
      {definedText.split(URL_REGEX).map((text, index) => {
        /* since we never move these components this key should be fine */
        return (
          <React.Fragment key={index}>
            {text}
            {urls[index] && (
              <a href={urls[index]} target="_blank" rel="noreferrer">
                {urls[index]}
              </a>
            )}
          </React.Fragment>
        )
      })}
    </WrappingTag>
  )
}
