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
import ManualLink from 'browser-components/ManualLink'
import Carousel from '../../modules/Carousel/Carousel'
import Slide from '../../modules/Carousel/Slide'

const title = 'Learn'
const category = 'guides'
const slides = [
  <Slide key="s1">
    <div className="col-sm-3">
      <h3>Start Learning</h3>
      <p className="lead">Graph database fundamentals.</p>
    </div>
    <div className="col-sm-9">
      <p>
        Neo4j is a graph database. You can store any data in Neo4j, then ask
        questions about how that data is related.
      </p>
      <ol className="big">
        <li>What is a graph database?</li>
        <li>How can I query a graph?</li>
        <li>What do people do with Neo4j?</li>
      </ol>
    </div>
  </Slide>,
  <Slide key="s2">
    <div className="col-sm-3">
      <h3>
        A&nbsp;
        <em>Graph</em> Database
      </h3>
      <p className="lead">
        Neo4j stores data in a Graph, with records called Nodes.
      </p>
    </div>
    <div className="col-sm-5">
      <p>
        The simplest graph has just a single node with some named values called
        Properties. Let's draw a social graph of our friends on the Neo4j team:
      </p>
      <ol>
        <li>Start by drawing a circle for the node</li>
        <li>Add the name Emil</li>
        <li>Note that he is from Sweden</li>
      </ol>
      <ul>
        <li>Nodes are the name for data records in a graph</li>
        <li>Data is stored as Properties</li>
        <li>Properties are simple name/value pairs</li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/one_node.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s3">
    <div className="col-sm-3">
      <h3>Labels</h3>
      <p className="lead">Associate a set of nodes.</p>
    </div>
    <div className="col-sm-5">
      <p>
        Nodes can be grouped together by applying a Label to each member. In our
        social graph, we'll label each node that represents a Person.
      </p>
      <ol>
        <li>Apply the label "Person" to the node we created for Emil</li>
        <li>Color "Person" nodes red</li>
      </ol>
      <ul>
        <li>A node can have zero or more labels</li>
        <li>Labels do not have any properties</li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/labeled_node.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s4">
    <div className="col-sm-3">
      <h3>More Nodes</h3>
      <p className="lead">
        Schema-free, nodes can have a mix of common and unique properties.
      </p>
    </div>
    <div className="col-sm-5">
      <p>
        Like any database, storing data in Neo4j can be as simple as adding more
        records. We'll add a few more nodes:
      </p>
      <ol>
        <li>Emil has a klout score of 99</li>
        <li>Johan, from Sweden, who is learning to surf</li>
        <li>Ian, from England, who is an author</li>
        <li>Rik, from Belgium, has a cat named Orval</li>
        <li>Allison, from California, who surfs</li>
      </ol>
      <ul>
        <li>Similar nodes can have different properties</li>
        <li>Properties can be strings, numbers, or booleans</li>
        <li>Neo4j can store billions of nodes</li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/more_nodes.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s5">
    <div className="col-sm-3">
      <h3>Consider Relationships</h3>
      <p className="lead">Connect nodes in the graph</p>
    </div>
    <div className="col-sm-5">
      <p className="summary">
        The real power of Neo4j is in connected data. To associate any two
        nodes, add a Relationship which describes how the records are related.
      </p>
      <p>In our social graph, we simply say who KNOWS whom:</p>
      <ol>
        <li>Emil KNOWS Johan and Ian</li>
        <li>Johan KNOWS Ian and Rik</li>
        <li>Rik and Ian KNOWS Allison</li>
      </ol>
      <ul>
        <li>Relationships always have direction</li>
        <li>Relationships always have a type</li>
        <li>Relationships form patterns of data</li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/relationships.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s6">
    <div className="col-sm-3">
      <h3>Relationship properties</h3>
      <p className="lead">Store information shared by two nodes.</p>
    </div>
    <div className="col-sm-5">
      <p className="summary">
        In a property graph, relationships are data records that can also
        contain properties. Looking more closely at Emil's relationships, note
        that:
      </p>
      <ul>
        <li>Emil has known Johan since 2001</li>
        <li>Emil rates Ian 5 (out of 5)</li>
        <li>Everyone else can have similar relationship properties</li>
      </ul>
    </div>
    <div className="col-sm-4">
      <img src="./assets/images/rel-props.png" className="img-responsive" />
    </div>
  </Slide>,
  <Slide key="s7">
    <div className="col-sm-4">
      <h3>Next steps</h3>
      <p>
        A property graph contains nodes and relationships, with properties on
        both.
      </p>
    </div>
    <div className="col-sm-4">
      <h3>Keep getting started</h3>
      <ul className="undecorated">
        <li>
          <a play-topic="intro">Intro</a> - a guided tour
        </li>
        <li>
          <a play-topic="cypher">Cypher</a> - query language
        </li>
        <li>
          <ManualLink chapter="cypher-manual" page="/">
            Neo4j Cypher Manual
          </ManualLink>
        </li>
      </ul>
    </div>
    <div className="col-sm-4">
      <h3>Jump into code</h3>
      <ul className="undecorated">
        <li>
          <a play-topic="movie-graph">The Movie Graph</a>
        </li>
      </ul>
    </div>
  </Slide>
]

export default { title, category, slides }
