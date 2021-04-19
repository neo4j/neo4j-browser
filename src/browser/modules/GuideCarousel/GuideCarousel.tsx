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
import Directives from 'browser-components/Directives'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import {
  GuideButtonContainers,
  CarouselIndicatorActive,
  CarouselIndicatorInactive,
  StyledCarousel,
  StyledCarouselButtonContainer,
  StyledCarouselButtonContainerInner,
  StyledCarouselCount,
  StyledUl,
  GuideNavButton
} from '../Sidebar/styled'

type GuideCarouselProps = {
  slides?: JSX.Element[]
  initialSlide?: number
  scrollToTop?: () => void
}
function GuidesCarousel({
  slides = [],
  initialSlide = 0,
  scrollToTop = () => undefined
}: GuideCarouselProps): JSX.Element {
  const [currentSlideIndex, gotoSlide] = useState(initialSlide)
  const currentSlide = slides[currentSlideIndex]
  const onFirstSlide = currentSlideIndex === 0
  const onLastSlide = currentSlideIndex === slides.length - 1
  function nextSlide() {
    if (!onLastSlide) {
      gotoSlide(index => index + 1)
    }
  }

  function prevSlide() {
    if (!onFirstSlide) {
      gotoSlide(index => index - 1)
    }
  }

  function onKeyUp(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      prevSlide()
    }
    if (e.key === 'ArrowRight') {
      nextSlide()
    }
  }

  useEffect(() => {
    // If we switch the guide, jump to initial Slide
    gotoSlide(initialSlide)
  }, [initialSlide, slides])

  useEffect(() => {
    // As we progress in the slides, scroll to top
    scrollToTop()
  }, [scrollToTop, currentSlideIndex])

  const moreThanOneSlide = slides.length > 1

  return (
    <StyledCarousel onKeyUp={onKeyUp}>
      <Directives content={currentSlide} />
      {moreThanOneSlide && (
        <>
          <GuideButtonContainers>
            <GuideNavButton onClick={prevSlide} disabled={onFirstSlide}>
              previous
            </GuideNavButton>
            <GuideNavButton onClick={nextSlide} disabled={onLastSlide}>
              next
            </GuideNavButton>
          </GuideButtonContainers>
          <StyledCarouselButtonContainer>
            <StyledCarouselButtonContainerInner>
              <StyledCarouselCount>
                {`${currentSlideIndex + 1} / ${slides.length}`}
              </StyledCarouselCount>
              <CarouselButton
                className="previous-slide"
                disabled={onFirstSlide}
                onClick={prevSlide}
              >
                <SlidePreviousIcon />
              </CarouselButton>
              <StyledUl>
                {slides.map((_, i) =>
                  i !== currentSlideIndex ? (
                    <CarouselIndicatorInactive
                      key={i}
                      aria-label={`${i + 1}`}
                      onClick={() => gotoSlide(i)}
                    >
                      <span />
                    </CarouselIndicatorInactive>
                  ) : (
                    <CarouselIndicatorActive
                      key={i}
                      aria-label={`${i + 1}`}
                      onClick={() => gotoSlide(i)}
                    >
                      <span />
                    </CarouselIndicatorActive>
                  )
                )}
              </StyledUl>
              <CarouselButton
                className="next-slide"
                disabled={onLastSlide}
                onClick={nextSlide}
              >
                <SlideNextIcon />
              </CarouselButton>
            </StyledCarouselButtonContainerInner>
          </StyledCarouselButtonContainer>
        </>
      )}
    </StyledCarousel>
  )
}
export default GuidesCarousel
