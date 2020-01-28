/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import React from 'react'
import { sanitizeQueryResult } from 'services/santize.utils'
import { convertUrlsToHrefTags } from './clickable-urls'
import { render } from '@testing-library/react'
import ClickableUrls from './clickable-urls'

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
        url => `<a href="${url}" target="_blank">${url}</a>`
      )

      expect(urls.map(convertUrlsToHrefTags)).toEqual(expected)
    })

    test('does not catch invalid or missing protocol urls', () => {
      expect(convertUrlsToHrefTags('https:google.com')).toBe('https:google.com')
      expect(convertUrlsToHrefTags('google.com')).toBe('google.com')
    })

    test('handles urls inside parentheses', () => {
      expect(convertUrlsToHrefTags('(http://goo.gl/1)')).toBe(
        '(<a href="http://goo.gl/1" target="_blank">http://goo.gl/1</a>)'
      )
    })

    test('does not include punctuation, comma, exclamation', () => {
      expect(convertUrlsToHrefTags('http://foo.com/.')).toBe(
        '<a href="http://foo.com/" target="_blank">http://foo.com/</a>.'
      )
      expect(convertUrlsToHrefTags('http://foo.com/!')).toBe(
        '<a href="http://foo.com/" target="_blank">http://foo.com/</a>!'
      )
      expect(convertUrlsToHrefTags('http://foo.com/,')).toBe(
        '<a href="http://foo.com/" target="_blank">http://foo.com/</a>,'
      )
    })

    test('Handles multiple URLs, even if in a text block', () => {
      const URLs = 'sftp://foo.se is better than ftp://bar.dk'
      const expectedURLs =
        '<a href="sftp://foo.se" target="_blank">sftp://foo.se</a> is better than <a href="ftp://bar.dk" target="_blank">ftp://bar.dk</a>'
      const textBlock = `
        Shred all toilet paper and spread around the house grass smells good.
        ${URLs}
        Tickle my belly at your own peril i will pester for food when you're in the kitchen even if it's salad murr
      `
      const expectedTextBlock = `
        Shred all toilet paper and spread around the house grass smells good.
        ${expectedURLs}
        Tickle my belly at your own peril i will pester for food when you're in the kitchen even if it's salad murr
      `

      expect(convertUrlsToHrefTags(URLs)).toBe(expectedURLs)
      expect(convertUrlsToHrefTags(textBlock)).toBe(expectedTextBlock)
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
              target="_blank"
            >
              http://twitter.com/neo4j
            </a>
            " onclick="alert(1)"&gt;Neo4j&lt;/a&gt;.
          </span>
        </div>
      `)
    })
  })
})
