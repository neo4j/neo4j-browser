import React, { useEffect, useState } from 'react'
import Directives from 'browser-components/Directives'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import { useRef } from 'react'
import {
  CarouselIndicatorActive,
  CarouselIndicatorInactive,
  SlideContainer,
  StyledCarousel,
  StyledCarouselButtonContainer,
  StyledCarouselButtonContainerInner,
  StyledCarouselCount,
  StyledUl
} from './styled'

type GuideCarouselProps = { slides?: JSX.Element[]; initialSlide?: number }
function GuideCarousel({
  slides = [],
  initialSlide = 0
}: GuideCarouselProps): JSX.Element {
  const [currentSlideIndex, gotoSlide] = useState(initialSlide)
  const currentSlide = slides[currentSlideIndex]
  const onFirstSlide = currentSlideIndex === 0
  const onLastSlide = currentSlideIndex === slides.length - 1
  const scrollRef = useRef<HTMLDivElement | null>(null)

  function scrollToTop() {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  function nextSlide() {
    if (!onLastSlide) {
      gotoSlide(index => index + 1)
      scrollToTop()
    }
  }

  function prevSlide() {
    if (!onFirstSlide) {
      gotoSlide(index => index - 1)
      scrollToTop()
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
    // As slides change, switch to initial Slide
    gotoSlide(initialSlide)
  }, [initialSlide, slides])
  const moreThanOneSlide = slides.length > 1

  return (
    <StyledCarousel onKeyUp={onKeyUp}>
      <SlideContainer ref={scrollRef}>
        <Directives content={currentSlide} />
      </SlideContainer>
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
    </StyledCarousel>
  )
}
export default GuideCarousel
