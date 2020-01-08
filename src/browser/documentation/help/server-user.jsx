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

import React from 'react'
const title = 'User admin'
const subtitle = 'User management for administrators'
const category = 'browserUiCommands'
const content = (
  <>
    <p>
      The <code>:server user</code> command allows you to manage user access to
      Neo4j such as creating/deleting users, suspending/activating users,
      managing user roles and resetting passwords.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Usage:</p>
        <p className="content">
          <code>{':server <action>'}</code>
        </p>
      </div>
      <div className="link">
        <p className="title">Actions:</p>
        <p className="content">
          <a server-topic="user list">:server user list</a>{' '}
          <a server-topic="user add">:server user add</a>
        </p>
      </div>
      <div className="link">
        <p className="title">Notes:</p>
        <p className="content">
          Only available in Neo4j Enterprise.
          <br />
          Only available to users with the admin role.
        </p>
      </div>
    </div>
  </>
)

export default { title, subtitle, category, content }
