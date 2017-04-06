/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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

import Guides from '../Guides/Guides'
import * as html from '../Guides/html'
import FrameTemplate from './FrameTemplate'

const PlayFrame = ({frame}) => {
  let guide = 'Play guide not specified'
  if (frame.result) {
    guide = <Guides withDirectives html={frame.result} />
  } else {
    const guideName = frame.cmd.replace(':play', '').replace(/\s|-/g, '').trim()
    if (guideName !== '') {
      const content = html[guideName]
      if (content !== undefined) {
        guide = <Guides withDirectives html={content} />
      } else {
        if (frame.error && frame.error.error) {
          guide = frame.error.error
        } else {
          guide = 'Guide not found'
        }
      }
    }
  }
  return (
    <FrameTemplate
      className='playFrame'
      header={frame}
      contents={guide}
    />
  )
}
export default PlayFrame
