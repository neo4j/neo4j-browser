/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import { parseGrass, objToCss } from 'services/grassUtils'

describe('parseGrass', () => {
  it('should create an object from a valid CSS string', () => {
    const css = 'body{ color: "red"; border: "1 px solid white";}'

    // When
    const obj = parseGrass(css)

    // Then
    expect(obj.body).toBeDefined()
    expect(obj.body.color).toEqual('red')
    expect(obj.body.border).toEqual('1 px solid white')
  })
  it('should create an object from a valid GraSS string', () => {
    const css =
      'node {caption: "<id>"; stroke: #ffffff;} relationship {caption: "{name}";} node.Person {caption: "{city} {zip}";}'

    // When
    const obj = parseGrass(css)

    // Then
    expect(obj.node).toBeDefined()
    expect(obj.node.caption).toEqual('<id>')
    expect(obj.node.stroke).toEqual('#ffffff')
    expect(obj.relationship).toBeDefined()
    expect(obj.relationship.caption).toEqual('{name}')
    expect(obj['node.Person'].caption).toEqual('{city} {zip}')
  })
})

describe('objToCss', () => {
  it('should create CSS from obj', () => {
    const obj = {
      body: {
        color: 'red',
        border: '1px solid green'
      },
      h1: {
        color: '#ffffff'
      }
    }
    const expected = `body {
  color: red;
  border: 1px solid green;
}
h1 {
  color: #ffffff;
}
`

    const css = objToCss(obj)

    expect(css).toEqual(expected)
  })
  it('should create GraSS from obj', () => {
    const obj = {
      node: {
        color: 'red',
        border: '1px solid green'
      },
      'node.Person': {
        color: 'green',
        border: '1px solid white',
        caption: '{name}'
      },
      relationship: {
        color: '#ffffff',
        caption: '<id>'
      }
    }
    const expected = `node {
  color: red;
  border: 1px solid green;
}
node.Person {
  color: green;
  border: 1px solid white;
  caption: "{name}";
}
relationship {
  color: #ffffff;
  caption: "<id>";
}
`

    const grass = objToCss(obj)

    expect(grass).toEqual(expected)
  })
  it('does not break on null', () => {
    const obj = null

    const css = objToCss(obj)
    expect(css).toEqual('')
  })
  it('does not break on string', () => {
    const obj = 'no object'

    const css = objToCss(obj)
    expect(css).toEqual(false)
  })
  it('does not break on undefined', () => {
    const css = objToCss()
    expect(css).toEqual(false)
  })
})
