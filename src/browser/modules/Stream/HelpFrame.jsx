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
import Docs from '../Docs/Docs'
import docs from '../../documentation'
import Directives from 'browser-components/Directives'
import FrameTemplate from '../Frame/FrameTemplate'
import FrameAside from '../Frame/FrameAside'
import { transformCommandToHelpTopic } from 'services/commandUtils'
import { DynamicTopics } from '../../documentation/templates/DynamicTopics'

const HelpFrame = ({ frame }) => {
  const { help, cypher, bolt } = docs
  const chapters = {
    ...help.chapters,
    ...cypher.chapters,
    ...bolt.chapters
  }

  let ret = 'Help topic not specified'
  let aside
  if (frame.result) {
    ret = <Docs html={frame.result} />
  } else {
    const helpTopic = transformCommandToHelpTopic(frame.cmd)
    if (helpTopic !== '') {
      const chapter = chapters[helpTopic] || chapters['unfound']
      const { title, subtitle } = chapter
      let { content } = chapter

      // The commands topic is a special case that uses dynamic data
      const dynamic = ['bolt', 'commands', 'play', 'guides', 'help', 'cypher']
      if (dynamic.includes(helpTopic)) {
        content = <DynamicTopics docs={docs} {...chapter} />
      }

      aside = title ? <FrameAside title={title} subtitle={subtitle} /> : null
      ret = <Docs content={content} />
    }
  }
  return (
    <FrameTemplate
      className='helpFrame help'
      header={frame}
      aside={aside}
      contents={<Directives content={ret} />}
    />
  )
}
export default HelpFrame
