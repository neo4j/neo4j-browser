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

import {
  parseGrass,
  objToCss,
  selectorStringToArray,
  selectorArrayToString
} from 'services/grassUtils'

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
  const origConsoleError = console.error
  beforeEach(() => {
    console.error = () => {}
  })
  afterEach(() => {
    console.error = origConsoleError
  })
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
    console.error = origConsoleError
  })
  it('should create GraSS from obj', () => {
    const origConsoleError = console.error
    console.error = () => {}
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
    console.error = origConsoleError
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

describe('selectors', () => {
  test('selectorStringToArray unescapes selectors with . in them', () => {
    const tests = [
      { test: 'foo', expect: ['foo'] },
      { test: 'foo.bar', expect: ['foo', 'bar'] },
      { test: 'foo.bar.baz', expect: ['foo', 'bar', 'baz'] },
      { test: 'foo\\.bar', expect: ['foo.bar'] },
      { test: 'foo\\.bar\\.baz', expect: ['foo.bar.baz'] },
      { test: 'foo\\.bar.baz\\.baz', expect: ['foo.bar', 'baz.baz'] },
      {
        test: 'node.foo\\.bar\\.baz.bax',
        expect: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorStringToArray(t.test)).toEqual(t.expect)
    })
  })
  test('selectorArrayToString escapes selectors with . in them', () => {
    const tests = [
      { expect: 'foo', test: ['foo'] },
      { expect: 'foo.bar', test: ['foo', 'bar'] },
      { expect: 'foo.bar.baz', test: ['foo', 'bar', 'baz'] },
      { expect: 'foo\\.bar', test: ['foo.bar'] },
      { expect: 'foo\\.bar\\.baz', test: ['foo.bar.baz'] },
      { expect: 'foo\\.bar.baz\\.baz', test: ['foo.bar', 'baz.baz'] },
      {
        expect: 'node.foo\\.bar\\.baz.bax',
        test: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorArrayToString(t.test)).toEqual(t.expect)
    })
  })
})
