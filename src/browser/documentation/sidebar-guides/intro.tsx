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
import { BuiltInGuideSidebarSlide } from '../../modules/Carousel/Slide'
import { isMac } from 'browser/modules/App/keyboardShortcuts'

const title = 'Intro Guide'
const identifier = 'intro'
const slides = [
  <BuiltInGuideSidebarSlide key="s1">
    <h3>Navigating Neo4j Browser</h3>
    <p>
      Neo4j Browser is a command-driven client as a web-based shell environment.
      It is perfect for running ad-hoc graph queries, with just enough ability
      to prototype a Neo4j-based application.
    </p>
    <ul className="big">
      <li>Developer focused.</li>
      <li>Used for writing and running Cypher graph queries.</li>
      <li>Exportable tabular results of any query result.</li>
      <li>
        Graph visualization of query results containing nodes and relationships.
      </li>
      <li>{`Convenient exploration of the Neo4j's HTTP API (REST).`}</li>
    </ul>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>Browser Editor (a.k.a. Editor)</h3>
    <p className="lead">
      <em>Edit and execute Cypher statements and Browser commands</em>
    </p>
    <p>
      The Editor is the primary interface for entering and running Cypher
      statements and Browser commands. Browser commands begin with{' '}
      <code>:</code>, for example, <code>:help</code>.
    </p>
    <table>
      <tbody>
        <tr>
          <td>Execute current command</td>
          <td className="padding5">
            <div className="key code">
              {isMac ? '<Cmd-Return>' : '<Ctrl-Return>'}
            </div>
          </td>
        </tr>
        <tr>
          <td>Previous command in history</td>
          <td className="padding5">
            <div className="key code">
              {isMac ? '<Cmd-Up-Arrow>' : '<Ctrl-Up-Arrow>'}
            </div>
          </td>
        </tr>
        <tr>
          <td>Next command in history</td>
          <td className="padding5">
            <div className="key code">
              {isMac ? '<Cmd-Down-Arrow>' : '<Ctrl-Down-Arrow>'}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p></p>
    <p>
      You can view the list of keybinding anytime by running{' '}
      <code>:help keys</code> or by pressing <b>F1 </b>in the Editor to see all
      Editor-specific keybindings.
    </p>
    <br />
    <video autoPlay loop muted playsInline>
      <source src="./assets/images/Keystrokes.mp4" type="video/mp4" />
    </video>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s3">
    <h3>Result frame</h3>
    <p className="lead">
      <em>Most recently executed command or Cypher query</em>
    </p>
    <p>
      A result frame is created for each execution and added to the top of the
      stream to create a scrollable collection in reverse chronological order.
    </p>
    <ul>
      <li>A pinned frame always stays in the same position. </li>
      <li>
        You can clear the stream of result frames by running the{' '}
        <code>:clear</code> command.
      </li>
      <li>
        The maximum number of result frames displayed in the stream is 30. You
        can change this number in the Browser Settings drawer.{' '}
      </li>
      <li>
        You can bring up the history of the executed commands and queries by
        running the <code className="nobreak">:history</code> command.
      </li>
    </ul>
    <br />
    <img src="./assets/images/Stream.png" className="img-responsive padding5" />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s4">
    <h3>Reusable frame</h3>
    <p className="lead">
      <em>Ammend your query in place</em>
    </p>
    <p>
      You can also iterate in the same frame instead of generating a scrollable
      stream of frames.
    </p>
    <p>
      Each reusable frame maintains its own local history of commands and
      updates the main one in the Editor, should you need to instantiate a new
      result frame from there.
    </p>
    <br />
    <video autoPlay loop muted playsInline>
      <source src="./assets/images/ReusableFrame.mp4" type="video/mp4" />
    </video>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s5">
    <h3>Sidebar: Database</h3>
    <p className="lead">
      <em>Database information</em>
    </p>
    When Neo4j is installed, it is initiated with two databases – a{' '}
    <code>system</code> database and a default <code>neo4j</code> database.
    Launching Neo4j Browser automatically points you to the{' '}
    <code className="nobreak">neo4j</code> database, shown by the{' '}
    <code>neo4j$</code>
    prompt in the Editor.
    <br />
    <img
      src="./assets/images/SidebarDB_Iinfo.png"
      className="img-responsive padding5"
    />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s6">
    <h3>Sidebar: Favorites</h3>
    <p className="lead">
      <em>Quick way to save your queries</em>
    </p>
    <p>
      Favorite queries or commands can be saved in the local storage and
      displayed in the sidebar.{' '}
    </p>
    <p>
      Favorites are global and independent of project or database, which means
      that you can access your Favorites from Neo4j Browser with different
      databases, hosting platforms, and data sets.
    </p>
    <br />
    <video autoPlay loop muted playsInline>
      <source src="./assets/images/Favorites.mp4" type="video/mp4" />
    </video>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s7">
    <h3>Sidebar: Project files</h3>
    <p className="lead">
      <em>Save cypher files to share with your colleagues</em>
    </p>
    <p>
      Project files allows you to save queries, guides, and other scripts, as
      Cypher files. Unlike favorites, which are saved in your local browser
      storage, project files are project-specific and are actual files stored in
      the project directory on your hard drive. All saved files are listed under
      the project they refer to.
    </p>
    <p></p>
    <p>The Project Files drawer is Neo4j Desktop specific.</p>
    <br />
    <video autoPlay loop muted playsInline>
      <source src="./assets/images/ProjectFiles.mp4" type="video/mp4" />
    </video>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s8">
    <h3>Next steps</h3>
    <ul className="undecorated">
      <li>
        <a data-exec="guide concepts">Concepts Guide</a> - Learn about Neo4j
        property graphs
      </li>
      <li>
        <a data-exec="guide cypher">Cypher Guide</a> - Learn Cypher basics
      </li>
    </ul>
    <br />
    <h3>References</h3>
    <ul className="undecorated">
      <li>
        <a help-topic="commands">Help commands</a> - Useful Neo4j Browser
        commands
      </li>
      <li>
        <a help-topic="keys">Help keys</a> - Keyboard shortcuts
      </li>
    </ul>
  </BuiltInGuideSidebarSlide>
]

export default { title, identifier, slides }
