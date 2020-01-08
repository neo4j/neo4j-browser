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
const title = 'Neo4j'
const subtitle = ''
const content = (
  <>
    <div className="teasers">
      <div className="teaser teaser-3">
        <h3>Learn about Neo4j</h3>
        <p className="lead">A graph epiphany awaits you.</p>
        <div className="icon-holder">
          <div className="icon sl green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle className="a" cx="13.5" cy="10.498" r="3.75" />
              <circle className="a" cx="21" cy="2.998" r="2.25" />
              <circle className="a" cx="21" cy="15.748" r="2.25" />
              <circle className="a" cx="13.5" cy="20.998" r="2.25" />
              <circle className="a" cx="3" cy="20.998" r="2.25" />
              <circle className="a" cx="3.75" cy="5.248" r="2.25" />
              <line
                className="a"
                x1="16.151"
                y1="7.848"
                x2="19.411"
                y2="4.588"
              />
              <line
                className="a"
                x1="16.794"
                y1="12.292"
                x2="19.079"
                y2="14.577"
              />
              <line className="a" x1="13.5" y1="14.248" x2="13.5" y2="18.748" />
              <line
                className="a"
                x1="10.851"
                y1="13.147"
                x2="4.59"
                y2="19.408"
              />
              <line className="a" x1="10.001" y1="9.149" x2="5.61" y2="6.514" />
            </svg>
          </div>
          <ul className="topic-bullets">
            <li>What is a graph database?</li>
            <li>How can I query a graph?</li>
            <li>What do people do with Neo4j?</li>
          </ul>
          <div className="clearfix" />
        </div>
        <button play-topic="concepts" className="btn btn-cta">
          Start Learning
        </button>
      </div>
      <div className="teaser teaser-3">
        <h3>Jump into code</h3>
        <p className="lead">Use Cypher, the graph query language.</p>
        <div className="icon-holder">
          <div className="icon sl yellow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <rect
                className="a"
                x="1.51"
                y="2.253"
                width="21"
                height="19.5"
                rx="1.5"
                ry="1.5"
              />
              <line className="a" x1="1.51" y1="6.753" x2="22.51" y2="6.753" />
              <line
                className="a"
                x1="12.01"
                y1="17.253"
                x2="16.51"
                y2="17.253"
              />
              <polyline
                className="a"
                points="7.51 11.253 10.51 14.253 7.51 17.253"
              />
            </svg>
          </div>
          <ul className="topic-bullets">
            <li>Code walk-throughs</li>
            <li>RDBMS to Graph</li>
          </ul>
          <div className="clearfix" />
        </div>
        <button play-topic="write-code" className="btn btn-cta">
          Write Code
        </button>
      </div>
      <div className="teaser teaser-3">
        <h3>System information</h3>
        <p className="lead">Key system health and status metrics.</p>
        <div className="icon-holder">
          <div className="icon sl red">
            <svg
              id="Regular"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <defs>
                <style>
                  {`
                    .cls-1 {
                      fill: none;
                      stroke: currentColor;
                      stroke-linecap: round;
                      stroke-linejoin: round;
                      stroke-width: 1.5px;
                    }`}
                </style>
              </defs>
              <path
                className="cls-1"
                d="M17.033,16.583l-4.492,4.686a.749.749,0,0,1-1.082,0L6.966,16.582"
              />
              <path
                className="cls-1"
                d="M1.471,10.587a5.675,5.675,0,0,1-.122-5.3h0a5.673,5.673,0,0,1,9.085-1.474L12,5.374l1.566-1.566a5.673,5.673,0,0,1,9.085,1.474h0a5.68,5.68,0,0,1-.119,5.3"
              />
              <path
                className="cls-1"
                d="M.75,13.583H7.268a.376.376,0,0,0,.336-.207L9.327,9.929a.376.376,0,0,1,.7.06l1.681,5.6a.376.376,0,0,0,.7.04l1.57-3.664a.376.376,0,0,1,.657-.061l1.116,1.674h7.5"
              />
            </svg>
          </div>
          <ul className="topic-bullets">
            <li>Store sizes</li>
            <li>ID allocation</li>
            <li>Page cache</li>
            <li>Transaction count</li>
            <li>Cluster status</li>
          </ul>
          <div className="clearfix" />
        </div>
        <button exec-topic="sysinfo" className="btn btn-cta">
          Monitor
        </button>
      </div>
    </div>
    <footer className="tight">
      <p className="text-muted">
        Copyright &copy;
        <a target="_blank" href="http://neo4j.com/" className="no-icon">
          {' '}
          Neo4j, Inc
        </a>
        &nbsp;<span>2002–2020</span>
      </p>
    </footer>
  </>
)

export default { title, subtitle, content }
