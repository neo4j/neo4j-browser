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
import React, { useEffect } from 'react'

import {
  GuideNavButton,
  GuideNavContainer,
  GuideProgressContainer,
  GuideUl,
  StyledCarousel
} from '../Sidebar/styled'
import Pagination from './Pagination'
import Directives from 'browser-components/Directives'

type GuideCarouselProps = {
  slides: JSX.Element[]
  currentSlideIndex: number
  scrollToTop?: () => void
  gotoSlide: (slideIndex: number) => void
}

function GuideCarousel({
  slides,
  currentSlideIndex,
  gotoSlide,
  scrollToTop = () => undefined
}: GuideCarouselProps): JSX.Element {
  const currentSlide = slides[currentSlideIndex]
  const onFirstSlide = currentSlideIndex === 0
  const onLastSlide = currentSlideIndex === slides.length - 1
  function nextSlide() {
    if (!onLastSlide) {
      gotoSlide(currentSlideIndex + 1)
    }
  }

  function prevSlide() {
    if (!onFirstSlide) {
      gotoSlide(currentSlideIndex - 1)
    }
  }

  useEffect(() => {
    // As we progress in the slides, scroll to top
    scrollToTop()
  }, [scrollToTop, currentSlideIndex])

  const moreThanOneSlide = slides.length > 1

  return (
    <StyledCarousel className="disable-font-ligatures">
      <Directives content={currentSlide} />
      {moreThanOneSlide && (
        <GuideNavContainer>
          <GuideNavButton
            onClick={prevSlide}
            disabled={onFirstSlide}
            data-testid="guidePreviousSlide"
          >
            Previous
          </GuideNavButton>
          <GuideUl>
            <GuideProgressContainer>
              <Pagination
                gotoIndex={gotoSlide}
                itemCount={slides.length}
                selectedIndex={currentSlideIndex}
              />
            </GuideProgressContainer>
          </GuideUl>
          <GuideNavButton
            onClick={nextSlide}
            disabled={onLastSlide}
            data-testid="guideNextSlide"
          >
            Next
          </GuideNavButton>
        </GuideNavContainer>
      )}
    </StyledCarousel>
  )
}

export default GuideCarousel
