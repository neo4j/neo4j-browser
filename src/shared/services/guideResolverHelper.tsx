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
import { includes, last, split, startsWith } from 'lodash-es'
import React from 'react'
import { URL } from 'whatwg-url'

import {
  addProtocolsToUrlList,
  extractAllowlistFromConfigString,
  resolveAllowlistWildcard
} from './utils'
import docs, { isBuiltInGuide } from 'browser/documentation'
import guideUnfound from 'browser/documentation/sidebar-guides/unfound'
import Slide from 'browser/modules/Carousel/Slide'
import MdSlide from 'browser/modules/Docs/MD/MdSlide'
import { splitMdSlides } from 'browser/modules/Docs/MD/splitMd'
import {
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledPreformattedArea
} from 'browser/modules/Stream/styled'
import { GlobalState } from 'shared/globalState'
import { fetchRemoteGuideAsync } from 'shared/modules/commands/helpers/playAndGuides'
import {
  getDefaultRemoteContentHostnameAllowlist,
  getRemoteContentHostnameAllowlist
} from 'shared/modules/dbMeta/dbMetaDuck'

interface ResponseException extends Error {
  response: Response
}

const { chapters } = docs.guide

export function tryGetRemoteInitialSlideFromUrl(url: string): number {
  const hashBang = includes(url, '#') ? last(split(url, '#')) : ''

  if (!startsWith(hashBang, 'slide-')) return 0

  const slideIndex = Number(last(split(hashBang, 'slide-')))

  return !isNaN(slideIndex) ? slideIndex : 0
}

export async function resolveGuide(
  identifier: string,
  state: GlobalState
): Promise<{
  slides: JSX.Element[]
  title: string
  identifier: string
  isError?: boolean
}> {
  const isUrl = identifier.startsWith('http')
  if (isUrl) {
    return await resolveRemoteGuideByUrl(identifier, state)
  }

  if (isBuiltInGuide(identifier)) {
    return { ...chapters[identifier], identifier }
  }

  try {
    return await resolveRemoteGuideByName(identifier, state)
  } catch (e) {}

  return { ...guideUnfound, identifier }
}

function mdTextToSlides(md: string): JSX.Element[] {
  return splitMdSlides(md).map((slide, index) => (
    // index is fine since we'll never move or delete slides
    <MdSlide key={index} md={slide} isSidebarSlide />
  ))
}

function getFirstHeaderText(html: string): string | null {
  const tmpDiv = document.createElement('div')
  tmpDiv.innerHTML = html
  const header = tmpDiv.querySelectorAll('h1, h2, h3, h4, h5, h6')[0]

  return header?.textContent?.trim() ?? null
}

function htmlTextToSlides(html: string): JSX.Element[] {
  const tmpDiv = document.createElement('div')
  tmpDiv.innerHTML = html
  const htmlSlides = tmpDiv.getElementsByTagName('slide')
  if (htmlSlides && htmlSlides.length) {
    return Array.from(htmlSlides).map((slide, index) => (
      <Slide key={index} html={slide.innerHTML} isSidebarSlide />
    ))
  }
  return [<Slide key="first" html={html} isSidebarSlide />]
}

async function resolveRemoteGuideByUrl(
  url: string,
  state: GlobalState
): Promise<{
  slides: JSX.Element[]
  title: string
  identifier: string
  isError?: boolean
}> {
  try {
    // URL constructor can throw
    const urlObject = new URL(url)
    urlObject.href = url
    const filenameExtension =
      (urlObject.pathname.includes('.') &&
        urlObject.pathname.split('.').pop()) ||
      'html'
    const allowlist = getRemoteContentHostnameAllowlist(state)

    const remoteGuide = await fetchRemoteGuideAsync(url, allowlist)
    const titleRegexMatch = remoteGuide.match(/<title>(.*?)<\/title>/)
    const title =
      (titleRegexMatch && titleRegexMatch[1])?.trim() ??
      getFirstHeaderText(remoteGuide) ??
      url

    if (['md', 'mdx'].includes(filenameExtension)) {
      return {
        slides: mdTextToSlides(remoteGuide),
        title,
        identifier: url
      }
    } else {
      return {
        slides: htmlTextToSlides(remoteGuide),
        title,
        identifier: url
      }
    }
  } catch (e) {
    if (
      (e as ResponseException).response &&
      (e as ResponseException).response.status === 404
    ) {
      return { ...guideUnfound, identifier: url }
    }
    return {
      title: 'Error',
      slides: [
        <Slide key="first" isSidebarSlide>
          <StyledHelpFrame>
            <StyledHelpContent>
              <StyledHelpDescription>
                <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
                <StyledErrorH4>Remote guide error</StyledErrorH4>
              </StyledHelpDescription>
              <StyledDiv>
                <StyledPreformattedArea>
                  {(e as ResponseException).name}:{' '}
                  {(e as ResponseException).message}
                </StyledPreformattedArea>
              </StyledDiv>
            </StyledHelpContent>
          </StyledHelpFrame>
        </Slide>
      ],
      identifier: url,
      isError: true
    }
  }
}

async function resolveRemoteGuideByName(
  guideName: string,
  state: GlobalState
): Promise<{ slides: JSX.Element[]; title: string; identifier: string }> {
  const allowlistStr = getRemoteContentHostnameAllowlist(state)
  const allowlist = extractAllowlistFromConfigString(allowlistStr)
  const defaultAllowlist = extractAllowlistFromConfigString(
    getDefaultRemoteContentHostnameAllowlist()
  )
  const resolvedWildcardAllowlist = resolveAllowlistWildcard(
    allowlist,
    defaultAllowlist
  )
  const urlAllowlist = addProtocolsToUrlList(resolvedWildcardAllowlist)
  const possibleGuidesUrls = urlAllowlist.map(
    (url: string) => `${url}/${guideName}`
  )

  return possibleGuidesUrls
    .reduce(
      (promiseChain: Promise<string>, currentUrl: string) =>
        promiseChain
          .catch(() => fetchRemoteGuideAsync(currentUrl, allowlistStr))
          .then(r => Promise.resolve(r)),
      Promise.reject(new Error())
    )
    .then(text => ({
      slides: htmlTextToSlides(text),
      title: guideName,
      identifier: guideName
    }))
}
