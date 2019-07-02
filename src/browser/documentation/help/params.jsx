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
const title = 'Parameters'
const subtitle = 'View and set parameters to be sent with queries.'
const category = 'cypherQueries'
const content = (
  <React.Fragment>
    <p>
      The <code>:params</code> command will show you a list of all your current
      parameters.
    </p>
    <p>
      Note that setting parameters using this method does not provide type
      safety with numbers.
      <br />
      Instead we advise you to set each param one by one using the{' '}
      <code>:param x => 1</code> syntax.
      <br />
      See <a help-topic='param'>:help param</a> for more info.
    </p>
    <p>
      The <code>:params {`{name: 'Stella', age: 24}`}</code> command will
      replace your current parameters with the new parameters defined in the
      object.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='param'>:help param</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
