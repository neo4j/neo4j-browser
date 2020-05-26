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

import React from 'react'
import { withBus } from 'react-suber'
import { fetchGuideFromWhitelistAction } from 'shared/modules/commands/commandsDuck'

import Docs from '../Docs/Docs'
import docs from '../../documentation'
import FrameTemplate from '../Frame/FrameTemplate'
import FrameAside from '../Frame/FrameAside'
import {
  splitStringOnFirst,
  transformCommandToHelpTopic
} from 'services/commandUtils'
import { ErrorsView } from './CypherFrame/ErrorsView'
import { useState } from 'react'
import { useEffect } from 'react'
import { CarouselButton } from 'browser-components/buttons/index'
import {
  StackPreviousIcon,
  StackNextIcon
} from 'browser-components/icons/Icons'

const {
  play: { chapters }
} = docs

const checkHtmlForSlides = html => {
  const el = document.createElement('html')
  el.innerHTML = html
  const slides = el.getElementsByTagName('slide')
  return !!slides.length
}

export function PlayFrame({ stack, bus }) {
  const [stackIndex, setStackIndex] = useState(0)
  const [atSlideStart, setAtSlideStart] = useState(null)
  const [atSlideEnd, setAtSlideEnd] = useState(null)
  const [guideObj, setGuideObj] = useState({})
  const [initialPlay, setInitialPlay] = useState(true)
  const currentFrame = stack[stackIndex]

  const onSlide = ({ hasPrev, hasNext }) => {
    setAtSlideStart(!hasPrev)
    setAtSlideEnd(!hasNext)
  }

  useEffect(() => {
    async function generate() {
      const shouldUseSlidePointer = initialPlay
      const { guide, aside, hasCarousel, isRemote } = await generateContent(
        currentFrame,
        bus,
        onSlide,
        shouldUseSlidePointer
      )
      setInitialPlay(false)
      setGuideObj({ guide, aside, hasCarousel, isRemote })
    }
    generate()
  }, [currentFrame])

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

function generateContent(stackFrame, bus, onSlide, shouldUseSlidePointer) {
  // Not found
  if (stackFrame.response && stackFrame.response.status === 404) {
    return unfound(stackFrame, chapters.unfound, onSlide)
  }

  const initialSlide = shouldUseSlidePointer ? stackFrame.initialSlide || 1 : 1

  // Found a remote guide
  if (stackFrame.result) {
    return {
      guide: (
        <Docs
          lastUpdate={stackFrame.ts}
          originFrameId={stackFrame.id}
          withDirectives
          initialSlide={initialSlide}
          html={stackFrame.result}
          onSlide={onSlide}
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

  // Some other error. Whitelist error etc.
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
  const guideName = transformCommandToHelpTopic(stackFrame.cmd || 'start')
  const guide = chapters[guideName] || {}
  // Check if content exists locally
  if (Object.keys(guide).length) {
    const { content, title, subtitle, slides = null } = guide
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

  // Check whitelisted remote URLs for name matches
  if (bus) {
    const topicInput = (splitStringOnFirst(stackFrame.cmd, ' ')[1] || '').trim()
    const action = fetchGuideFromWhitelistAction(topicInput)
    return new Promise(resolve => {
      bus.self(action.type, action, res => {
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

const unfound = (frame, { content, title, subtitle }, onSlide) => {
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
