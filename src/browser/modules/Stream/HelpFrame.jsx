/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import Slide from '../Guides/Slide'
import * as html from '../Help/html'
import * as chapters from '../Help'
import Directives from 'browser-components/Directives'
import FrameTemplate from '../Frame/FrameTemplate'
import { transformCommandToHelpTopic } from 'services/commandUtils'
import { H3 } from 'browser-components/headers'
import { Lead } from 'browser-components/Text'

const Aside = ({ title, subtitle }) => {
  return title ? (
    <React.Fragment>
      {title && <H3>{title}</H3>}
      {subtitle && <Lead>{subtitle}</Lead>}
    </React.Fragment>
  ) : null
}

const HelpFrame = ({ frame }) => {
  let help = 'Help topic not specified'
  let aside
  if (frame.result) {
    help = <Slide html={frame.result} />
  } else {
    const helpTopic = transformCommandToHelpTopic(frame.cmd)
    if (helpTopic !== '') {
      const { title, subtitle, content } = chapters.default[helpTopic]
      if (content !== undefined) {
        aside = title ? <Aside title={title} subtitle={subtitle} /> : null
        help = <Slide content={content} />
      } else {
        help = <Slide content={html.default['_unfound']} />
      }
    }
  }
  return (
    <FrameTemplate
      className='helpFrame help'
      header={frame}
      aside={aside}
      contents={<Directives content={help} />}
    />
  )
}
export default HelpFrame
