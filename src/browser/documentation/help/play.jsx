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
const title = 'Play'
const subtitle = 'Display a mini-deck'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      The <code>:play</code> command loads a mini-deck with either guide
      material or sample data.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Usage:</p>
        <p className='content'>
          <code>{`:play <guide | data>`}</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>System information:</p>
        <p className='content'>
          <code exec-topic='sysinfo'>:sysinfo</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Guides</p>
        <p className='content'>
          <a play-topic='intro'>:play intro</a>
          <a play-topic='concepts'>:play concepts</a>
          <a play-topic='cypher'>:play cypher</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Examples:</p>
        <p className='content'>
          <a play-topic='movie graph'>:play movie graph</a>
          <a play-topic='northwind graph'>:play northwind graph</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
