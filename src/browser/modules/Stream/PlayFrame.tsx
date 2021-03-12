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
import docs from '../../documentation'
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
import { connect } from 'react-redux'
import { GlobalState } from 'shared/globalState'
import { inCloudEnv } from 'shared/modules/app/appDuck'
import { isEnterprise } from 'shared/modules/dbMeta/dbMetaDuck'
import styled from 'styled-components'

const PromotionContainer = styled.div`
  margin-bottom: 5px;
  margin-right: 25px;
  margin-left: 25px;
  border: solid 1px #008cc1;
  border-radius: 4px;
  box-shadow: 0px 0px 2px rgb(52 58 67 / 10%), 0px 1px 2px rgb(52 58 67 / 8%),
    0px 1px 4px rgb(52 58 67 / 8%);
  font-size: 14px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const PromotionButton = styled.button`
  outline: none;
  background-color: #428bca;
  border-radius: 4px;
  border: none;
  padding: 7px;
`
const ResetStyleLink = styled.a`
  color: #fff !important;
  font-weight: 600;
`
const AboutLink = styled.a`
  &:before {
    display: inline-block;
    content: ' ';
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'> <path d='M14.3524 4.42834L2.53033 16.2504C2.23744 16.5433 1.76256 16.5433 1.46967 16.2504C1.17678 15.9575 1.17678 15.4826 1.46967 15.1897L13.2917 3.36768H2.74941C2.3352 3.36768 1.99941 3.03189 1.99941 2.61768C1.99941 2.20346 2.3352 1.86768 2.74941 1.86768H15.1022H15.1024C15.204 1.86768 15.301 1.88792 15.3894 1.92458C15.4759 1.96035 15.557 2.01298 15.6278 2.08247C15.6311 2.08571 15.6343 2.08897 15.6376 2.09226C15.707 2.16302 15.7597 2.24414 15.7954 2.33059C15.8321 2.41902 15.8524 2.51598 15.8524 2.61768V14.9706C15.8524 15.3848 15.5166 15.7206 15.1024 15.7206C14.6881 15.7206 14.3524 15.3848 14.3524 14.9706V4.42834Z' fill='%2368BDF4'/></svg>");
    height: 12px;
    width: 12px;
    margin-right: 7px;
  }
`
const auraPromotion = (
  <PromotionContainer>
    Try Neo4j Browser in our cloud service!
    <PromotionButton>
      <ResetStyleLink
        href="https://neo4j.com/cloud/aura/free/?utm_medium=referral&utm_source=browser"
        rel="noreferrer"
        target="_blank"
      >
        Get started with Aura Free tier
      </ResetStyleLink>
    </PromotionButton>
    <AboutLink
      href="https://neo4j.com/cloud/aura/?utm_medium=referral&utm_source=browser"
      rel="noreferrer"
      target="_blank"
    >
      About Neo4j Aura
    </AboutLink>
  </PromotionContainer>
)

const {
  play: { chapters }
} = docs

const checkHtmlForSlides = (html: any) => {
  const el = document.createElement('html')
  el.innerHTML = html
  const slides = el.getElementsByTagName('slide')
  return !!slides.length
}

export function PlayFrame({ stack, bus, showPromotion }: any): JSX.Element {
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
        shouldUseSlidePointer,
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
  shouldUseSlidePointer: any,
  showPromotion = false
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

  const guide = chapters[guideName] || {}
  // Check if content exists locally
  if (Object.keys(guide).length) {
    const { content, title, subtitle, slides = null } = guide

    const isPlayStart = stackFrame.cmd.trim() === ':play start'
    const updatedContent =
      isPlayStart && showPromotion ? (
        <>
          {auraPromotion} {content}
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

const mapStateToProps = (state: GlobalState) => ({
  showPromotion: !isEnterprise(state) && !inCloudEnv(state)
})

export default connect(mapStateToProps)(withBus(PlayFrame))
