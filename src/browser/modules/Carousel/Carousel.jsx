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
import Directives from 'browser-components/Directives'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import CarouselSlidePicker from './CarouselSlidePicker'
import {
  StyledCarousel,
  SlideContainer,
  StyledCarouselButtonContainer,
  StyledCarouselButtonContainerInner,
  StyledCarouselCount,
  StyledCarouselIntroAnimated,
  StyledCarouselIntro
} from './styled'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'

export default function Carousel({
  onSlide,
  showIntro,
  withDirectives,
  originFrameId,
  initialSlide = 1,
  slides = []
}) {
  const [visibleSlide, setVisibleSlide] = useState(() => {
    if (initialSlide <= slides.length) {
      return initialSlide - 1
    }
    return 0
  })
  const [wasClicked, setWasClicked] = useState(false)
  const myRef = useRef()

  useEffect(() => {
    let showSlideIndex = 0
    if (initialSlide <= slides.length) {
      showSlideIndex = initialSlide - 1
    }
    setVisibleSlide(showSlideIndex)
  }, [slides, initialSlide])

  useEffect(() => {
    if (onSlide) {
      onSlide({
        slideIndex: visibleSlide,
        hasNext: visibleSlide < slides.length - 1,
        hasPrev: visibleSlide > 0
      })
    }
  }, [visibleSlide])

  const onKeyDown = ev => {
    if (ev.keyCode === 37 && visibleSlide !== 0) {
      prev()
    }
    if (ev.keyCode === 39 && visibleSlide !== slides.length - 1) {
      next()
    }
  }

  const next = () => {
    const slide = visibleSlide + 1
    setVisibleSlide(slide)
    setWasClicked(true)
    myRef.current.scrollTo(0, 0)
  }

  const prev = () => {
    const slide = visibleSlide - 1
    setVisibleSlide(slide)
    myRef.current.scrollTo(0, 0)
  }

  const getSlide = slideNumber => {
    return slides[slideNumber]
  }

  const goToSlide = slideNumber => {
    setVisibleSlide(slideNumber)
  }

  return (
    <StyledCarousel
      data-testid="carousel"
      onKeyUp={e => onKeyDown(e)}
      tabIndex="0"
    >
      {visibleSlide > 0 && (
        <CarouselButton
          className="previous-slide  rounded"
          data-testid="previousSlide"
          onClick={prev}
        >
          <SlidePreviousIcon />
        </CarouselButton>
      )}
      <StyledCarouselButtonContainer>
        {showIntro && !wasClicked && (
          <StyledCarouselIntroAnimated className="carousel-intro-animation">
            <StyledCarouselIntro>
              <span>Use the navigation to get started</span>
              <span>{'->'}</span>
            </StyledCarouselIntro>
          </StyledCarouselIntroAnimated>
        )}
        <StyledCarouselButtonContainerInner>
          <StyledCarouselCount>
            {`${visibleSlide + 1} / ${slides.length}`}
          </StyledCarouselCount>
          <CarouselButton
            className="previous-slide"
            disabled={visibleSlide === 0}
            onClick={prev}
          >
            <SlidePreviousIcon />
          </CarouselButton>
          <CarouselSlidePicker
            slides={slides}
            visibleSlide={visibleSlide}
            onClickEvent={slideNumber => goToSlide(slideNumber)}
          />
          <CarouselButton
            className="next-slide"
            disabled={visibleSlide === slides.length - 1}
            onClick={next}
          >
            <SlideNextIcon />
          </CarouselButton>
        </StyledCarouselButtonContainerInner>
      </StyledCarouselButtonContainer>
      <SlideContainer ref={myRef}>
        {withDirectives ? (
          <Directives
            originFrameId={originFrameId}
            content={getSlide(visibleSlide)}
          />
        ) : (
          getSlide(visibleSlide)
        )}
      </SlideContainer>
      {visibleSlide < slides.length - 1 && (
        <CarouselButton
          className="next-slide rounded"
          data-testid="nextSlide"
          onClick={next}
        >
          <SlideNextIcon />
        </CarouselButton>
      )}
    </StyledCarousel>
  )
}
