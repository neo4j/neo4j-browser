import React, { useEffect, useState } from 'react'
import Directives from 'browser-components/Directives'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import {
  CarouselIndicatorActive,
  CarouselIndicatorInactive,
  SlideContainer,
  StyledCarousel,
  StyledCarouselButtonContainer,
  StyledCarouselButtonContainerInner,
  StyledCarouselCount,
  StyledUl
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
    <div>
      <StyledCarousel onKeyUp={onKeyUp}>
        <SlideContainer>
          <Directives content={currentSlide} />
        </SlideContainer>
      </StyledCarousel>
      {moreThanOneSlide && (
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
      )}
    </div>
  )
}
export default GuidesCarousel
