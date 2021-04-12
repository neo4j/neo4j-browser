import React from 'react'
import MdxSlide from 'browser/modules/Docs/MDX/MdxSlide'
import Slide from 'browser/modules/Carousel/Slide'
import docs, { isGuideChapter } from 'browser/documentation'
import guideUnfound from 'browser/documentation/play-guides/unfound'
import { ErrorView } from 'browser/modules/Stream/ErrorFrame'
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

const { chapters } = docs.play
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
    // TODO Fix so all guides have slides, to avoid this dance
    const guide = chapters[guideName]
    const title = guide.title
    if (guide.slides) {
      return { slides: guide.slides, title }
    }
    if (guide.content) {
      return { slides: [guide.content], title }
    }
    return { slides: [], title }
  }

  try {
    return await resolveRemoteGuideFromName(guideName, store)
  } catch (e) {}

  return unfound
}

function mdxTextToSlides(mdx: string): JSX.Element[] {
  return splitMdxSlides(mdx).map((slide, index) => (
    // index is fine since we'll never move or delete slides
    <MdxSlide key={index} mdx={slide} />
  ))
}

function htmlTextToSlides(html: string): JSX.Element[] {
  const tmpDiv = document.createElement('div')
  tmpDiv.innerHTML = html
  const htmlSlides = tmpDiv.getElementsByTagName('slide')
  if (htmlSlides && htmlSlides.length) {
    return Array.from(htmlSlides).map((slide, index) => (
      <Slide key={index} html={slide.innerHTML} />
    ))
  }
  return [<Slide key="first" html={html} />]
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
    const titleRegexMatch = remoteGuide.match('<title>(.*?)</title>')
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
        <ErrorView
          key="only"
          result={{
            message: `Error: The remote server responded with the following error: 
${e.name}: ${e.message}`,
            code: 'Remote guide error'
          }}
        />
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
