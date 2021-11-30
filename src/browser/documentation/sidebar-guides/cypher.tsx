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

const title = 'Cypher Guide'
const identifier = 'cypher'
const slides = [
  <BuiltInGuideSidebarSlide key="s1">
    <p className="lead">
      <em>{`Neo4j's graph query language`}</em>
    </p>
    <p>
      {`Neo4j's Cypher language is purpose-built for working with graph data.`}
    </p>
    <ul className="big">
      <li>Uses patterns to describe graph data.</li>
      <li>Familiar SQL-like clauses.</li>
      <li>Declarative, describing what to find, not how to find it.</li>
    </ul>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>CREATE</h3>
    <p className="lead">
      <em>Create a node</em>
    </p>
    <p>{`Let's use Cypher to generate a small social graph.`}</p>
    <p>
      <b>NOTE:</b>
      {` This guide assumes that you use an empty graph. `}
    </p>
    <ol>
      <li>
        Click this code block and bring it into the Editor:
        <pre className="pre-scrollable code runnable">
          {"CREATE (ee:Person {name: 'Emil', from: 'Sweden', kloutScore: 99})"}
        </pre>
        <ul style={{ marginLeft: '10px', paddingLeft: '10px' }}>
          <li>
            <code>CREATE</code> creates the node.
          </li>
          <li>
            <code>()</code> indicates the node.
          </li>
          <li>
            <code>ee:Person</code> – <code>ee</code> is the node variable and
            <code>Person</code> is the node label.
          </li>
          <li>
            <code>{'{}'}</code> contains the properties that describe the node.
          </li>
        </ul>
      </li>
      <li>
        Run the Cypher code by clicking the <b>Run</b> button.
      </li>
    </ol>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s3">
    <h3>MATCH</h3>
    <p className="lead">
      <em>Find nodes</em>
    </p>
    <p>Now, find the node representing Emil.</p>
    <ol>
      <li>
        Click this code block and bring it into the Editor:
        <pre className="pre-scrollable code runnable">
          {`MATCH (ee:Person) WHERE ee.name = 'Emil' RETURN ee;`}
        </pre>
        <ul style={{ marginLeft: '10px', paddingLeft: '10px' }}>
          <li>
            <code>MATCH</code> specifies a pattern of nodes and relationships.
          </li>
          <li>
            <code>(ee:Person)</code> is a single node pattern with label{' '}
            <code>Person</code>. It assigns matches to the variable{' '}
            <code>ee</code>.
          </li>
          <li>
            <code>WHERE</code> filters the query.
          </li>
          <li>
            <code>{`ee.name = 'Emil'`}</code>
            {` compares name property to the
            value `}
            <code>Emil</code>.
          </li>
          <li>
            <code>RETURN</code> returns particular results.
          </li>
        </ul>
      </li>
      <li>
        Run the Cypher code by clicking the <b>Run</b> button.
      </li>
      <br />
    </ol>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s4">
    <h3>CREATE more data</h3>
    <p className="lead">
      <em>Nodes and relationships</em>
    </p>
    <p>
      The <code>CREATE</code> clause can create many nodes and relationships at
      once.
    </p>
    <pre className="pre-scrollable code runnable">
      {`MATCH (ee:Person) WHERE ee.name = 'Emil'
CREATE (js:Person { name: 'Johan', from: 'Sweden', learn: 'surfing' }),
(ir:Person { name: 'Ian', from: 'England', title: 'author' }),
(rvb:Person { name: 'Rik', from: 'Belgium', pet: 'Orval' }),
(ally:Person { name: 'Allison', from: 'California', hobby: 'surfing' }),
(ee)-[:KNOWS {since: 2001}]->(js),(ee)-[:KNOWS {rating: 5}]->(ir),
(js)-[:KNOWS]->(ir),(js)-[:KNOWS]->(rvb),
(ir)-[:KNOWS]->(js),(ir)-[:KNOWS]->(ally),
(rvb)-[:KNOWS]->(ally)`}
    </pre>
    <br />
  </BuiltInGuideSidebarSlide>,

  <BuiltInGuideSidebarSlide key="s5">
    <h3>MATCH patterns</h3>
    <p className="lead">
      <em>Describe what to find in the graph</em>
    </p>
    <p className="summary">
      {`For instance, a pattern can be used to find Emil's friends:`}
    </p>
    <pre className="pre-scrollable code runnable">
      {`MATCH (ee:Person)-[:KNOWS]-(friends)
WHERE ee.name = 'Emil' RETURN ee, friends`}
    </pre>
    <ul style={{ marginLeft: '10px', paddingLeft: '10px' }}>
      <li>
        <code>MATCH</code> describes what nodes will be retrieved based upon the
        pattern.
      </li>
      <li>
        <code>(ee)</code> is the node reference that will be returned based upon
        the <code>WHERE</code> clause.
      </li>
      <li>
        <code>-[:KNOWS]-</code> matches the <code>KNOWS</code> relationships (in
        either direction) from <code>ee</code>.
      </li>
      <li>
        <code>(friends)</code>
        {` represents the nodes that are Emil's friends.`}
      </li>
      <li>
        <code>RETURN</code> returns the node, referenced here by{' '}
        <code>(ee)</code>, and the related <code>(friends)</code> nodes found.
      </li>
    </ul>
  </BuiltInGuideSidebarSlide>,

  <BuiltInGuideSidebarSlide key="s6">
    <h3>Next steps</h3>
    <ul className="undecorated">
      <li>
        <a data-exec="guide movie-graph">The Movie Graph</a> – Queries and
        recommendations with Cypher - movie use case.
      </li>
      <li>
        <a data-exec="guide northwind-graph">The Northwind Graph</a> – Translate
        and import relation data into graph.
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
