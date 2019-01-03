/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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
import Slide from '../Guides/Slide'
import * as html from '../Help/html'
import Directives from 'browser-components/Directives'
import FrameTemplate from './FrameTemplate'
import { transformCommandToHelpTopic } from 'services/commandUtils'

const HelpFrame = ({ frame }) => {
  let help = 'Help topic not specified'
  if (frame.result) {
    help = <Slide html={frame.result} />
  } else {
    const helpTopic = transformCommandToHelpTopic(frame.cmd)
    if (helpTopic !== '') {
      const content = html.default[helpTopic]
      if (content !== undefined) {
        help = <Slide html={content} />
      } else {
        help = <Slide html={html.default['_unfound']} />
      }
    }
  }
  return (
    <FrameTemplate
      className='helpFrame'
      header={frame}
      contents={<Directives content={help} />}
    />
  )
}
export default HelpFrame
