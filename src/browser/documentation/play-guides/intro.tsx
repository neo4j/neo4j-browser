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

import { isMac } from 'neo4j-arc/common'

import Slide from '../../modules/Carousel/Slide'

const title = 'Intro'
const slides = [
  <Slide key="s1">
    <div className="col-sm-3">
      <h3>Introduction</h3>
      <p className="lead">Neo4j Browser User Interface </p>
    </div>
    <div className="col-sm-6">
      <p>
        Neo4j Browser is a command driven client, like a web-based shell
        environment. It is perfect for running ad-hoc graph queries, with just
        enough ability to prototype a Neo4j-based application.
      </p>
      <ul className="big">
        <li>
          Developer focused, for writing and running graph queries with Cypher
        </li>
        <li>Exportable tabular results of any query result</li>
        <li>
          Graph visualization of query results containing nodes and
          relationships
        </li>
      </ul>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>Editor</h3>
      <p className="lead">Command editing and execution</p>
    </div>
    <div className="col-sm-5">
      <p>
        Editor pane is used to edit and run for Cypher statements and Browser
        commands. Browser commands begin with <code>:</code>, for example{' '}
        <code>:help</code>
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
        <code>:help keys</code> or by pressing <b>F1 </b>in the editor to see
        all editor-specific keybindings.
      </p>
    </div>
    <div className="col-sm-4">
      <video autoPlay loop muted playsInline>
        <source src="./assets/images/Keystrokes.mp4" type="video/mp4" />
      </video>
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Result frame</h3>
      <p className="lead">Most recently executed command or Cypher query.</p>
    </div>
    <div className="col-sm-5">
      <p>
        A result frame is created for each command execution, added to the top
        of the stream to create a scrollable collection in reverse chronological
        order.
      </p>
      <ul>
        <li>If a frame is pinned it will always stay in the same position. </li>
        <li>
          You can clear the stream of result frames running <code>:clear</code>{' '}
          command.
        </li>
        <li>
          There are maximum 30 result frames displayed in the stream. You can
          change this number in the Settings sidebar.{' '}
        </li>
        <li>
          You can bring up the history of the executed commands and queries by
          running <code className="nobreak">:history</code> command.
        </li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/Stream.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>Reusable frame</h3>
      <p className="lead">Instead of the stream</p>
    </div>
    <div className="col-sm-5">
      <p>
        You can also iterate in the same frame instead of generating a
        scrollable stream of frames.
      </p>
      <p>Adjust your preferences in the Settings sidebar tab.</p>
    </div>
    <div className="col-sm-4">
      <video autoPlay loop muted playsInline>
        <source src="./assets/images/ReusableFrame.mp4" type="video/mp4" />
      </video>
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Sidebar: Database information</h3>
      <p className="lead">Database metadata</p>
    </div>
    <div className="col-sm-5">
      When Neo4j is installed, it is initiated with two databases - a{' '}
      <code>system</code> database and a default <code>neo4j</code> database.
      Launching Neo4j Browser will automatically point us to the{' '}
      <code className="nobreak">neo4j default</code> database, shown by the
      neo4j$ prompt in the editor.
    </div>
    <div className="col-sm-4">
      <img
        src="./assets/images/SidebarDB_Iinfo.png"
        className="img-responsive"
      />
    </div>
  </Slide>,

  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Sidebar: Favorites</h3>
      <p className="lead">Quick way to save your queries</p>
    </div>
    <div className="col-sm-5">
      <p>
        Favorite queries or commands can be saved in the local storage and
        displayed in the sidebar.{' '}
      </p>
      <p>
        Favorites are global and independent of project or database which means
        that you can access your Favorites from Neo4j Browser with different
        databases, hosting platforms, and data sets.
      </p>
    </div>
    <div className="col-sm-4">
      <video autoPlay loop muted playsInline>
        <source src="./assets/images/Favorites.mp4" type="video/mp4" />
      </video>
    </div>
  </Slide>,

  <Slide key="s7">
    <div className="col-sm-3">
      <h3>Sidebar: Project files</h3>
      <p className="lead">Save cypher files to share with your colleagues</p>
    </div>
    <div className="col-sm-5">
      Queries and commands can also be saved as <b>Project files</b>. Project
      folder can be reached through Neo4j Desktop and your hard disk.
    </div>
    <div className="col-sm-4">
      <video autoPlay loop muted playsInline>
        <source src="./assets/images/ProjectFiles.mp4" type="video/mp4" />
      </video>
    </div>
  </Slide>,

  <Slide key="s8">
    <div className="col-sm-4">
      <div>
        {' '}
        &#127968;
        <a play-topic="start">Play start</a> - Back to getting started
      </div>
    </div>

    <div className="col-sm-4">
      <h3>Next steps</h3>
      <ul className="undecorated">
        <li>
          <a help-topic="commands">Help commands</a> - Useful Neo4j Browser
          commands
        </li>
        <li>
          <a help-topic="keys">Help keys</a> - Keyboard shortcuts
        </li>
      </ul>
    </div>
    <div className="col-sm-4">
      <h3>Jump into code</h3>
      <ul className="undecorated">
        <li>
          <a play-topic="cypher">Play Cypher</a> - Learn Cypher basics
        </li>
      </ul>
    </div>
  </Slide>
]

export default { title, slides, showIntro: true }
