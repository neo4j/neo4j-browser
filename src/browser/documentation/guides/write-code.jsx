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
const title = 'Write Code'
const subtitle = 'Jump right into coding with example data graphs'
const category = 'guides'
const content = (
  <>
    <div className="teaser teaser-2">
      <h3>Movie Graph</h3>
      <p className="lead">
        Actors &amp; movies in cross-referenced pop culture.
      </p>
      <div className="icon-holder">
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <rect
              className="a"
              x="0.75"
              y="12"
              width="16.5"
              height="10.5"
              rx="1.5"
              ry="1.5"
            />
            <path
              className="a"
              d="M17.25,19.832l4.987,1.87A.75.75,0,0,0,23.25,21V14.164a.749.749,0,0,0-1.013-.7l-4.987,1.87Z"
            />
            <line className="a" x1="4.5" y1="15" x2="12.75" y2="15" />
            <circle className="a" cx="4.5" cy="5.25" r="3.75" />
            <circle className="a" cx="14.25" cy="6" r="3" />
          </svg>
        </div>
        <ul className="topic-bullets">
          <li>A complete example graph.</li>
          <li>Demonstrates common query patterns.</li>
          <li>Solves the Bacon path!</li>
        </ul>
        <div className="clearfix" />
      </div>
      <button play-topic="movie-graph" className="btn btn-cta">
        Create a graph
      </button>
    </div>
    <div className="teaser teaser-2">
      <h3>Northwind Graph</h3>
      <p className="lead">From RDBMS to Neo4j, using a classic data set.</p>
      <div className="icon-holder">
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              className="a"
              d="M21.75,12.75v9a1.5,1.5,0,0,1-1.5,1.5H3.75a1.5,1.5,0,0,1-1.5-1.5v-9"
            />
            <path
              className="a"
              d="M21.148.75H2.852a.751.751,0,0,0-.733.587L.75,7.5a2.25,2.25,0,0,0,4.5,0,2.25,2.25,0,0,0,4.5,0,2.25,2.25,0,0,0,4.5,0,2.25,2.25,0,0,0,4.5,0,2.25,2.25,0,0,0,4.5,0L21.88,1.337A.749.749,0,0,0,21.148.75Z"
            />
            <path className="a" d="M18.75,16.5a3,3,0,0,0-6,0v6.75h6Z" />
            <rect
              className="a"
              x="5.25"
              y="15.75"
              width="4.5"
              height="4.5"
              rx="0.75"
              ry="0.75"
            />
            <path
              className="a"
              d="M16.125,18a.375.375,0,1,1-.375.375A.375.375,0,0,1,16.125,18"
            />
          </svg>
        </div>
        <ul className="topic-bullets">
          <li>Load data from external CSV files.</li>
          <li>Convert RDBMS schema to graph structure.</li>
          <li>Run sample queries.</li>
        </ul>
        <div className="clearfix" />
      </div>
      <button play-topic="northwind-graph" className="btn btn-cta">
        Convert from RDBMS
      </button>
    </div>
  </>
)

export default { title, subtitle, category, content }
