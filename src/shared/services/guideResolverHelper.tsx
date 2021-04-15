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
import MdxSlide from 'browser/modules/Docs/MDX/MdxSlide'
import Slide from 'browser/modules/Carousel/Slide'
import docs, { isGuideChapter } from 'browser/documentation'
import guideUnfound from 'browser/documentation/play-guides/unfound'
import {
  addProtocolsToUrlList,
  extractAllowlistFromConfigString,
  resolveAllowlistWildcard
} from './utils'
import { fetchRemoteGuide } from 'shared/modules/commands/helpers/play'
import {
  getDefaultRemoteContentHostnameAllowlist,
  getRemoteContentHostnameAllowlist
} from 'shared/modules/dbMeta/dbMetaDuck'
import { splitMdxSlides } from 'browser/modules/Docs/MDX/splitMdx'
import {
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledPreformattedArea
} from 'browser/modules/Stream/styled'

const { chapters } = docs.guide
const unfound = { slides: [guideUnfound.content], title: guideUnfound.title }

export async function resolveGuide(
  guideName: string,
  store: any
): Promise<{ slides: JSX.Element[]; title: string }> {
  const isUrl = guideName.startsWith('http')
  if (isUrl) {
    return await resolveRemoteGuideFromURL(guideName, store)
  }

  if (isGuideChapter(guideName)) {
    return chapters[guideName]
  }

  try {
    return await resolveRemoteGuideFromName(guideName, store)
  } catch (e) {}

  return unfound
}

function mdxTextToSlides(mdx: string): JSX.Element[] {
  return splitMdxSlides(mdx).map((slide, index) => (
    // index is fine since we'll never move or delete slides
    <MdxSlide key={index} mdx={slide} forceDarkMode />
  ))
}

function htmlTextToSlides(html: string): JSX.Element[] {
  const tmpDiv = document.createElement('div')
  tmpDiv.innerHTML = html
  const htmlSlides = tmpDiv.getElementsByTagName('slide')
  if (htmlSlides && htmlSlides.length) {
    return Array.from(htmlSlides).map((slide, index) => (
      <Slide key={index} html={slide.innerHTML} forceDarkMode />
    ))
  }
  return [<Slide key="first" html={html} forceDarkMode />]
}

async function resolveRemoteGuideFromURL(
  guideName: string,
  store: any
): Promise<{ slides: JSX.Element[]; title: string }> {
  const url = guideName
  const urlObject = new URL(url)
  urlObject.href = url
  const filenameExtension =
    (urlObject.pathname.includes('.') && urlObject.pathname.split('.').pop()) ||
    'html'
  const allowlist = getRemoteContentHostnameAllowlist(store.getState())

  try {
    const remoteGuide = await fetchRemoteGuide(url, allowlist)
    const titleRegexMatch = remoteGuide.match(/<title>(.*?)<\/title>/)
    const title = (titleRegexMatch && titleRegexMatch[1])?.trim() || guideName
    if (['md', 'mdx'].includes(filenameExtension)) {
      return {
        slides: mdxTextToSlides(remoteGuide),
        title
      }
    } else {
      return {
        slides: htmlTextToSlides(remoteGuide),
        title
      }
    }
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return unfound
    }
    return {
      title: 'Error',
      slides: [
        <Slide key="first" forceDarkMode>
          <StyledHelpFrame>
            <StyledHelpContent>
              <StyledHelpDescription>
                <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
                <StyledErrorH4>Remote guide error</StyledErrorH4>
              </StyledHelpDescription>
              <StyledDiv>
                <StyledPreformattedArea>
                  {e.name}: {e.message}
                </StyledPreformattedArea>
              </StyledDiv>
            </StyledHelpContent>
          </StyledHelpFrame>
        </Slide>
      ]
    }
  }
}

async function resolveRemoteGuideFromName(
  guideName: string,
  store: any
): Promise<{ slides: JSX.Element[]; title: string }> {
  const allowlistStr = getRemoteContentHostnameAllowlist(store.getState())
  const allowlist = extractAllowlistFromConfigString(allowlistStr)
  const defaultAllowlist = extractAllowlistFromConfigString(
    getDefaultRemoteContentHostnameAllowlist(store.getState())
  )
  const resolvedWildcardAllowlist = resolveAllowlistWildcard(
    allowlist,
    defaultAllowlist
  )
  const urlAllowlist = addProtocolsToUrlList(resolvedWildcardAllowlist)
  const possibleGuidesUrls: string[] = urlAllowlist.map(
    (url: string) => `${url}/${guideName}`
  )

  return possibleGuidesUrls
    .reduce(
      (promiseChain: Promise<any>, currentUrl: string) =>
        promiseChain
          .catch(() => fetchRemoteGuide(currentUrl, allowlistStr))
          .then(r => Promise.resolve(r)),
      Promise.reject(new Error())
    )
    .then(text => ({
      slides: htmlTextToSlides(text),
      title: guideName
    }))
}
