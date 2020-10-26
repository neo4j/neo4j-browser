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

import Grass from './graphStyle'

describe('grass', () => {
  it('can generate a default style', () => {
    // Given
    const grass = new Grass()

    // When
    const styleStr = grass.toString()

    // Then
    expect(styleStr).toEqual(
      `node {
  diameter: 50px;
  color: #A5ABB6;
  border-color: #9AA1AC;
  border-width: 2px;
  text-color-internal: #FFFFFF;
  font-size: 10px;
}

relationship {
  color: #A5ABB6;
  shaft-width: 1px;
  font-size: 8px;
  padding: 3px;
  text-color-external: #000000;
  text-color-internal: #FFFFFF;
  caption: '<type>';
}

`
    )
  })
  it('can generate a style for a node with a simple label', () => {
    // Given
    const grass = new Grass()
    const node = {
      labels: ['foo']
    }

    // When
    grass.forNode(node)
    const styleStr = grass.toString()

    // Then
    expect(styleStr).toEqual(`node {
  diameter: 50px;
  color: #A5ABB6;
  border-color: #9AA1AC;
  border-width: 2px;
  text-color-internal: #FFFFFF;
  font-size: 10px;
}

relationship {
  color: #A5ABB6;
  shaft-width: 1px;
  font-size: 8px;
  padding: 3px;
  text-color-external: #000000;
  text-color-internal: #FFFFFF;
  caption: '<type>';
}

node.foo {
  color: #C990C0;
  border-color: #b261a5;
  text-color-internal: #FFFFFF;
  defaultCaption: <id>;
}

`)
  })
  it('can generate a style for a node with a label with a dot', () => {
    // Given
    const grass = new Grass()
    const node = {
      labels: ['foo.bar']
    }

    // When
    grass.forNode(node)
    const styleStr = grass.toString()

    // Then
    expect(styleStr).toEqual(`node {
  diameter: 50px;
  color: #A5ABB6;
  border-color: #9AA1AC;
  border-width: 2px;
  text-color-internal: #FFFFFF;
  font-size: 10px;
}

relationship {
  color: #A5ABB6;
  shaft-width: 1px;
  font-size: 8px;
  padding: 3px;
  text-color-external: #000000;
  text-color-internal: #FFFFFF;
  caption: '<type>';
}

node.foo\\.bar {
  color: #C990C0;
  border-color: #b261a5;
  text-color-internal: #FFFFFF;
  defaultCaption: <id>;
}

`)
  })
  it('can generate a style for a relationship with a type with a dot', () => {
    // Given
    const grass = new Grass()

    // When
    grass.loadRules()
    grass.changeForSelector('relationship.REL\\.TYPE', {
      caption: 'yo'
    })
    // grass.forRelationship(rel)
    const styleStr = grass.toString()

    // Then
    expect(styleStr).toEqual(`node {
  diameter: 50px;
  color: #A5ABB6;
  border-color: #9AA1AC;
  border-width: 2px;
  text-color-internal: #FFFFFF;
  font-size: 10px;
}

relationship {
  color: #A5ABB6;
  shaft-width: 1px;
  font-size: 8px;
  padding: 3px;
  text-color-external: #000000;
  text-color-internal: #FFFFFF;
  caption: '<type>';
}

relationship.REL\\.TYPE {
  caption: 'yo';
}

`)
  })
})
