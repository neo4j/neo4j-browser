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
import React, { useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { ThemeContext } from 'styled-components'
import { Bus } from 'suber'

import {
  StackNextIcon,
  StackPreviousIcon
} from 'browser-components/icons/LegacyIcons'

import docs, { DocItem, isPlayChapter } from '../../documentation'
import Docs from '../Docs/Docs'
import { splitMdSlides } from '../Docs/MD/splitMd'
import FrameAside from '../Frame/FrameAside'
import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import { ErrorsView } from './CypherFrame/ErrorsView/ErrorsView'
import { AuraPromoLink, PromotionContainer } from './styled'
import { CarouselButton } from 'browser-components/buttons'
import {
  splitStringOnFirst,
  transformCommandToHelpTopic
} from 'services/commandUtils'
import { GlobalState } from 'shared/globalState'
import { inDesktop } from 'shared/modules/app/appDuck'
import { fetchGuideFromAllowlistAction } from 'shared/modules/commands/commandsDuck'
import { isConnectedAuraHost } from 'shared/modules/connections/connectionsDuck'
import { getEdition, isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import { DARK_THEME } from 'shared/modules/settings/settingsDuck'
import { LAST_GUIDE_SLIDE } from 'shared/modules/udc/udcDuck'

const AuraPromotion = () => {
  const theme = useContext(ThemeContext)
  const isDarkTheme = theme.name === DARK_THEME

  return (
    <PromotionContainer>
      <AuraPromoLink
        href="https://neo4j.com/cloud/aura/pricing/?utm_medium=browser&utm_source=ce&utm_campaign=wl_v1"
        rel="noreferrer"
        target="_blank"
      >
        Sign up
      </AuraPromoLink>
      for a free Neo4j cloud instance with
      <img
        src={`./assets/images/aura-logo${isDarkTheme ? '-inverted' : ''}.svg`}
        alt="Neo4j"
        style={{ marginLeft: '5px', width: '100%', maxWidth: '140px' }}
      />
    </PromotionContainer>
  )
}

const {
  play: { chapters }
} = docs

const checkHtmlForSlides = (html: any) => {
  const el = document.createElement('html')
  el.innerHTML = html
  const slides = el.getElementsByTagName('slide')
  return !!slides.length
}

type PlayFrameProps = {
  stack: any
  bus: Bus
  showPromotion: boolean
  isFullscreen: boolean
  isCollapsed: boolean
}
export function PlayFrame({
  stack,
  bus,
  showPromotion,
  isFullscreen,
  isCollapsed
}: PlayFrameProps): JSX.Element {
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
    stackIndex !== 0 &&
      atSlideEnd &&
      bus &&
      bus.send(LAST_GUIDE_SLIDE, undefined)
  }, [stackIndex, bus, atSlideEnd])

  useEffect(() => {
    let stillMounted = true
    async function generate() {
      const { guide, aside, hasCarousel, isRemote } = await generateContent(
        currentFrame,
        bus,
        onSlide,
        initialPlay,
        showPromotion
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
  }, [bus, currentFrame, showPromotion])

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
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      aside={aside}
      contents={guideAndNav}
      hasSlides={hasCarousel || stack.length > 1}
    />
  )
}

type Content = {
  guide: JSX.Element
  hasCarousel?: boolean
  isRemote?: boolean
  aside?: JSX.Element | null
}
function generateContent(
  stackFrame: any,
  bus: Bus,
  onSlide: any,
  shouldUseSlidePointer: boolean,
  showPromotion = false
): Content | Promise<Content> {
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
            md={stackFrame.result}
            onSlide={onSlide}
            originFrameId={stackFrame.id}
            withDirectives
          />
        ),
        hasCarousel: splitMdSlides(stackFrame.result).length > 1,
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

    const isPlayStart = stackFrame.cmd.trim() === ':play start'
    const updatedContent =
      isPlayStart && showPromotion ? (
        <>
          {content}
          <AuraPromotion />
        </>
      ) : (
        content
      )

    return {
      guide: (
        <Docs
          lastUpdate={stackFrame.ts}
          originFrameId={stackFrame.id}
          withDirectives
          content={slides ? null : updatedContent}
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

  // Check allow-listed remote URLs for name matches
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
  { content, title, subtitle }: DocItem,
  onSlide: any
): Content => {
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

const mapStateToProps = (state: GlobalState) => ({
  showPromotion:
    (getEdition(state) !== null &&
      !isEnterprise(state) &&
      !isConnectedAuraHost(state)) ||
    inDesktop(state)
})

export default connect(mapStateToProps)(withBus(PlayFrame))
