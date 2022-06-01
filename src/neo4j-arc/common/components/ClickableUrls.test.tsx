/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 * This file is part of Neo4j.
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
import { render } from '@testing-library/react'
import React from 'react'

import { ClickableUrls } from 'neo4j-arc/common'

describe('clickable-urls', () => {
  describe('convertUrlsToHrefTags', () => {
    test('handles most common URL formats', () => {
      const urls = [
        'bolt://127.0.0.1:7687',
        'http://foo.com',
        'http://goo.gl',
        'https://foo.com',
        'https://www.foo.com',
        'https://www.foo.com/',
        'https://www.foo.com/bar',
        'http://goo.gl/1',
        'http://goo.gl/2',
        'http://firstround.com/review/thoughts-on-gender-and-radical-candor/?ct=t(How_Does_Your_Leadership_Team_Rate_12_3_2015)',
        'https://google.com',
        'http://www.cool.com.au',
        'http://www.cool.com.au/ersdfs',
        'http://www.cool.com.au/ersdfs?dfd=dfgd@s=1',
        'http://www.cool.com:81/index.html'
      ]
      const expected = urls.map(
        url =>
          `
        <div>
          <span>
            
            <a
              href="${url}"
              rel="noreferrer"
              target="_blank"
            >
              ${url}
            </a>
            
          </span>
        </div>
      `
      )

      urls.forEach((url, index) =>
        expect(
          render(<ClickableUrls text={url} />).container
        ).toMatchInlineSnapshot(expected[index])
      )
    })

    test('does not catch invalid or missing protocol urls', () => {
      expect(render(<ClickableUrls text={'google.com'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            google.com
          </span>
        </div>
      `)
      expect(render(<ClickableUrls text={'https:google.com'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            https:google.com
          </span>
        </div>
      `)
    })

    test('handles urls inside parentheses', () => {
      expect(render(<ClickableUrls text={'(http://goo.gl/1)'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            (
            <a
              href="http://goo.gl/1"
              rel="noreferrer"
              target="_blank"
            >
              http://goo.gl/1
            </a>
            )
          </span>
        </div>
      `)
    })

    test('does not include punctuation, comma, exclamation', () => {
      expect(render(<ClickableUrls text={'http://foo.com/.'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            
            <a
              href="http://foo.com/"
              rel="noreferrer"
              target="_blank"
            >
              http://foo.com/
            </a>
            .
          </span>
        </div>
      `)

      expect(render(<ClickableUrls text={'http://foo.com/!'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            
            <a
              href="http://foo.com/"
              rel="noreferrer"
              target="_blank"
            >
              http://foo.com/
            </a>
            !
          </span>
        </div>
      `)

      expect(render(<ClickableUrls text={'http://foo.com/,'} />).container)
        .toMatchInlineSnapshot(`
        <div>
          <span>
            
            <a
              href="http://foo.com/"
              rel="noreferrer"
              target="_blank"
            >
              http://foo.com/
            </a>
            ,
          </span>
        </div>
      `)
    })

    test('Handles multiple URLs, even if in a text block', () => {
      const URLs = 'sftp://foo.se is better than ftp://bar.dk'
      const textBlock = `
Long black tulips, born in your blue tints
Lemongrass eyelids, smoke in your slick lips
(${URLs})
Chocolate chapstick, backbeat strat flips
Swimming pool spaceships, light through the wave tips
      `

      const { container } = render(<ClickableUrls text={textBlock} />)
      expect(container).toMatchInlineSnapshot(`
        <div>
          <span>
            
        Long black tulips, born in your blue tints
        Lemongrass eyelids, smoke in your slick lips
        (
            <a
              href="sftp://foo.se"
              rel="noreferrer"
              target="_blank"
            >
              sftp://foo.se
            </a>
             is better than 
            <a
              href="ftp://bar.dk"
              rel="noreferrer"
              target="_blank"
            >
              ftp://bar.dk
            </a>
            )
        Chocolate chapstick, backbeat strat flips
        Swimming pool spaceships, light through the wave tips
              
          </span>
        </div>
      `)
    })
  })
  describe('ClickableUrls', () => {
    it('renders escaped HTML except for generated tags', () => {
      const text = `Hello, my <strong>name</strong> is <a href="http://twitter.com/neo4j" onClick="alert(1)">Neo4j</a>.`

      const { container } = render(<ClickableUrls text={text} />)
      expect(container).toMatchInlineSnapshot(`
        <div>
          <span>
            Hello, my &lt;strong&gt;name&lt;/strong&gt; is &lt;a href="
            <a
              href="http://twitter.com/neo4j"
              rel="noreferrer"
              target="_blank"
            >
              http://twitter.com/neo4j
            </a>
            " onClick="alert(1)"&gt;Neo4j&lt;/a&gt;.
          </span>
        </div>
      `)
    })
  })
})
