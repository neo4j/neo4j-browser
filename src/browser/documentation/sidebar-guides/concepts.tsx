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

const title = 'Concepts Guide'
const category = 'guides'
const identifier = 'concepts'
const slides = [
  <BuiltInGuideSidebarSlide key="s1">
    <h3>Property graph model concepts</h3>
    <p className="lead">
      <em>Basic concepts to get you going</em>
    </p>
    <p>
      A graph database can store any kind of data using a few basic concepts:
    </p>
    <ul className="big">
      <li>Nodes - represent entities of a domain.</li>
      <li>Labels - shape the domain by grouping nodes into sets.</li>
      <li>Relationships - connect two nodes.</li>
      <li>
        Properties - named values that add qualities to nodes and relationships.
      </li>
    </ul>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>Nodes</h3>
    <p className="lead">
      <em>Neo4j stores data in a graph as nodes</em>
    </p>
    <p>
      {`The simplest graph has just a single node with some named values called
      properties. For example, let's draw a social graph:`}
    </p>
    <ol>
      <li>Draw a circle for a node.</li>
      <li>Add the name Emil.</li>
      <li>Note that he is from Sweden.</li>
    </ol>
    <br />
    <img src="./assets/images/one_node.png" className="img-responsive" />
    <br />
    <p className="paragraph">
      <em>
        <p>Key info:</p>
        <ul>
          <li>
            Nodes often represents entities or discrete objects that can be
            classified with zero or more labels.
          </li>
          <li>Data is stored as properties of the nodes.</li>
          <li>Properties are simple key-value pairs.</li>
        </ul>
      </em>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s3">
    <h3>Labels</h3>
    <p className="lead">
      <em>Associate a set of nodes</em>
    </p>
    <p>
      Nodes can be grouped together by applying a Label to each member. In this
      social graph, you label each node that represents a Person.
    </p>
    <ol>
      <li>{`Add the label "Person" to the node you created for Emil.`}</li>
      <li>{`Color the "Person" node red.`}</li>
    </ol>
    <br />
    <img src="./assets/images/labeled_node.png" className="img-responsive" />
    <br />
    <p className="paragraph">
      <em>
        <p>Key info:</p>
        <ul>
          <li>A node can have zero or more labels.</li>
          <li>Labels are used to classify nodes.</li>
        </ul>
      </em>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s4">
    <h3>More Nodes</h3>
    <p className="lead">
      <em>Neo4j is schema-free</em>
    </p>
    <p>
      Like any database, storing data in Neo4j can be as simple as adding more
      nodes. Nodes can have a mix of common and unique properties. Add a few
      more nodes and properties:
    </p>
    <ol>
      <li>Emil, Klout score of 99.</li>
      <li>Johan, from Sweden, who is learning to surf.</li>
      <li>Ian, from England, who is an author.</li>
      <li>Rik, from Belgium, who has a cat named Orval.</li>
      <li>Allison, from the US, who surfs.</li>
    </ol>
    <br />
    <img src="./assets/images/more_nodes.png" className="img-responsive" />
    <br />
    <p className="paragraph">
      <em>
        <p>Key info:</p>
        <ul>
          <li>Similar nodes can have different properties.</li>
          <li>
            Properties can hold different data types, such as `number`,
            `string`, or `boolean`.
          </li>
          <li>
            Properties can also be a homogeneous list (array) containing
            strings, numbers, or boolean values.
          </li>
          <li>Neo4j can store billions of nodes.</li>
        </ul>
      </em>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s5">
    <h3>Relationships</h3>
    <p className="lead">
      <em>Connect the nodes</em>
    </p>
    <p>
      The real power of Neo4j is in connected data. To associate any two nodes,
      add a relationship that describes how the records are related.
    </p>
    <p>
      In our social graph, you can simply say who knows (relationship type
      KNOWS) whom:
    </p>
    <ol>
      <li>Emil knows Johan and Ian.</li>
      <li>Johan knows Ian and Rik.</li>
      <li>Rik and Ian know Allison.</li>
    </ol>
    <br />
    <img src="./assets/images/relationships.png" className="img-responsive" />
    <br />
    <p className="paragraph">
      <em>
        <p>Key info:</p>
        <ul>
          <li>Relationships always have a direction.</li>
          <li>Relationships always have a type.</li>
          <li>
            Relationships form patterns of data, the structure of the graph.
          </li>
        </ul>
      </em>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s6">
    <h3>Relationship properties</h3>
    <p className="lead">
      <em>Store information shared by two nodes</em>
    </p>
    <p>
      {`In a property graph, relationships can also contain properties that
      describe the relationship. Looking more closely at Emil's
      relationships, note that:`}
    </p>
    <ul>
      <li>Emil has known Johan since 2001.</li>
      <li>Emil rates Ian 5 (out of 5).</li>
      <li>Everyone else can have similar relationship properties.</li>
    </ul>
    <br />
    <img src="./assets/images/rel-props.png" className="img-responsive" />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="seventh">
    <h3>Next steps</h3>
    <ul className="undecorated">
      <li>
        <a data-exec="guide cypher">Cypher Guide</a> - Learn Cypher basics
      </li>
    </ul>
  </BuiltInGuideSidebarSlide>
]

export default { title, category, identifier, slides }
