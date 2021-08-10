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

import React, { useEffect, useState } from 'react'
import { withBus } from 'react-suber'
import { fetchGuideFromAllowlistAction } from 'shared/modules/commands/commandsDuck'

import Docs from '../Docs/Docs'
import docs, { isPlayChapter } from '../../documentation'
import FrameTemplate from '../Frame/FrameTemplate'
import FrameAside from '../Frame/FrameAside'
import {
  splitStringOnFirst,
  transformCommandToHelpTopic
} from 'services/commandUtils'
import { ErrorsView } from './CypherFrame/ErrorsView'
import { CarouselButton } from 'browser-components/buttons/index'
import {
  StackPreviousIcon,
  StackNextIcon
} from 'browser-components/icons/Icons'
import { splitMdxSlides } from '../Docs/MDX/splitMdx'
import { LAST_GUIDE_SLIDE } from 'shared/modules/udc/udcDuck'

const {
  play: { chapters }
} = docs

const checkHtmlForSlides = (html: any) => {
  const el = document.createElement('html')
  el.innerHTML = html
  const slides = el.getElementsByTagName('slide')
  return !!slides.length
}

export function PlayFrame({ stack, bus }: any): JSX.Element {
  const [stackIndex, setStackIndex] = useState(0)
  const [atSlideStart, setAtSlideStart] = useState<boolean | null>(null)
  const [atSlideEnd, setAtSlideEnd] = useState<boolean | null>(null)
  const [guideObj, setGuideObj] = useState<any>({})
  const [initialPlay, setInitialPlay] = useState(true)
  const currentFrame = stack[stackIndex]

  const onSlide = ({ hasPrev, hasNext }: any) => {
    setAtSlideStart(!hasPrev)
    setAtSlideEnd(!hasNext)
  }

  useEffect(() => {
    stackIndex !== 0 && atSlideEnd && bus && bus.send(LAST_GUIDE_SLIDE)
  }, [stackIndex, bus, atSlideEnd])

  useEffect(() => {
    let stillMounted = true
    async function generate() {
      const shouldUseSlidePointer = initialPlay
      const { guide, aside, hasCarousel, isRemote } = await generateContent(
        currentFrame,
        bus,
        onSlide,
        shouldUseSlidePointer
      )
      if (stillMounted) {
        setInitialPlay(false)
        setGuideObj({ guide, aside, hasCarousel, isRemote })
      }
    }
    generate()

    return () => {
      stillMounted = false
    }
    // The full dependency array causes a re-run which switches to slide 1
  }, [bus, currentFrame])

  const { guide, aside, hasCarousel, isRemote } = guideObj

  const prevGuide = () => {
    setStackIndex(stackIndex + 1)
  }

  const nextGuide = () => {
    setStackIndex(stackIndex - 1)
  }

  useEffect(() => {
    setStackIndex(0)
  }, [stack.length])

  const prevBtn =
    stackIndex === stack.length - 1 || !atSlideStart ? null : (
      <CarouselButton
        className="previous-slide rounded"
        data-testid="prev-in-stack-button"
        onClick={prevGuide}
      >
        <StackPreviousIcon />
      </CarouselButton>
    )

  const nextBtn =
    stackIndex === 0 || !atSlideEnd ? null : (
      <CarouselButton
        className="next-slide rounded"
        data-testid="next-in-stack-button"
        onClick={nextGuide}
      >
        <StackNextIcon />
      </CarouselButton>
    )

  const classNames = ['playFrame']
  if (hasCarousel || stack.length > 1) {
    classNames.push('has-carousel')
  }
  if (isRemote) {
    classNames.push('is-remote')
  }

  let guideAndNav = guide
  if (stack.length > 1) {
    guideAndNav = (
      <React.Fragment>
        {prevBtn}
        <div>{guide}</div>
        {nextBtn}
      </React.Fragment>
    )
  }
  return (
    <FrameTemplate
      className={classNames.join(' ')}
      header={stack[stackIndex]}
      aside={aside}
      contents={guideAndNav}
    />
  )
}

function generateContent(
  stackFrame: any,
  bus: any,
  onSlide: any,
  shouldUseSlidePointer: any
): any {
  // Not found
  if (stackFrame.response && stackFrame.response.status === 404) {
    return unfound(stackFrame, chapters.unfound, onSlide)
  }

  const initialSlide = shouldUseSlidePointer ? stackFrame.initialSlide || 1 : 1

  // Found a remote guide
  if (stackFrame.result) {
    if (['md', 'mdx'].includes(stackFrame.filenameExtension)) {
      return {
        guide: (
          <Docs
            initialSlide={stackFrame.initialSlide || 1}
            lastUpdate={stackFrame.ts}
            mdx={stackFrame.result}
            onSlide={onSlide}
            originFrameId={stackFrame.id}
            withDirectives
          />
        ),
        hasCarousel: splitMdxSlides(stackFrame.result).length > 1,
        isRemote: true
      }
    }

    return {
      guide: (
        <Docs
          html={stackFrame.result}
          initialSlide={initialSlide}
          lastUpdate={stackFrame.ts}
          onSlide={onSlide}
          originFrameId={stackFrame.id}
          withDirectives
        />
      ),
      hasCarousel: checkHtmlForSlides(stackFrame.result),
      isRemote: true
    }
  }

  // Request error
  if (stackFrame.response && stackFrame.error && stackFrame.error.error) {
    return {
      guide: (
        <ErrorsView
          result={{
            message:
              'Error: The remote server responded with the following error: ' +
              stackFrame.response.status,
            code: 'Remote guide error'
          }}
          onSlide={onSlide}
        />
      )
    }
  }

  // Some other error. Allowlist error etc.
  if (stackFrame.error && stackFrame.error.error) {
    return {
      guide: (
        <ErrorsView
          result={{
            message: stackFrame.error.error,
            code: 'Remote guide error'
          }}
          onSlide={onSlide}
        />
      )
    }
  }

  // Local guides
  const guideName = transformCommandToHelpTopic(
    stackFrame.cmd.trim() === ':play' ? ':play start' : stackFrame.cmd
  )

  // Check if content exists locally
  if (isPlayChapter(guideName)) {
    const { content, title, subtitle, slides = null } = chapters[guideName]
    return {
      guide: (
        <Docs
          lastUpdate={stackFrame.ts}
          originFrameId={stackFrame.id}
          withDirectives
          content={slides ? null : content}
          slides={slides ? slides : null}
          initialSlide={initialSlide}
          onSlide={onSlide}
        />
      ),
      aside:
        !slides && title ? (
          <FrameAside title={title} subtitle={subtitle} />
        ) : null,
      hasCarousel: !!slides
    }
  }

  // Check allowlisted remote URLs for name matches
  if (bus) {
    const topicInput = (splitStringOnFirst(stackFrame.cmd, ' ')[1] || '').trim()
    const action = fetchGuideFromAllowlistAction(topicInput)
    return new Promise(resolve => {
      bus.self(action.type, action, (res: any) => {
        if (!res.success) {
          // No luck
          return resolve(unfound(stackFrame, chapters.unfound, onSlide))
        }
        // Found remote guide
        return resolve({
          guide: (
            <Docs
              lastUpdate={stackFrame.ts}
              originFrameId={stackFrame.id}
              initialSlide={initialSlide}
              withDirectives
              html={res.result}
              onSlide={onSlide}
            />
          ),
          hasCarousel: checkHtmlForSlides(res.result)
        })
      })
    })
  } else {
    // No bus. Give up
    return unfound(stackFrame, chapters.unfound, onSlide)
  }
}

const unfound = (
  frame: any,
  { content, title, subtitle }: any,
  onSlide: any
) => {
  return {
    guide: (
      <Docs
        lastUpdate={frame.ts}
        originFrameId={frame.id}
        withDirectives
        content={content}
        onSlide={onSlide}
      />
    ),
    aside: <FrameAside title={title} subtitle={subtitle} />,
    isRemote: false,
    hasCarousel: false
  }
}

export default withBus(PlayFrame)
