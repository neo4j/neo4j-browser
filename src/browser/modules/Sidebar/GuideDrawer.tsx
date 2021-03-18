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

import React, { useState } from 'react'
import { Drawer, DrawerBody, DrawerHeader } from 'browser-components/drawer'
import styled from 'styled-components'
import { GuideChapter, isGuideChapter } from 'browser/documentation'
import docs from '../../documentation'

const StyledCarousel = styled.div`
  padding-bottom: 20px;
  min-height: 100%;
  width: 100%;
  outline: none;

  .row {
    margin-left: 0;
    margin-right: 0;
  }
`

const SlideContainer = styled.div`
  padding: 0;
  width: 100%;
  display: inline-block;
`

const StyledCarouselButtonContainer = styled.div`
  color: ${props => props.theme.secondaryButtonText};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  z-index: 10;
  border-top: ${props => props.theme.inFrameBorder};
  margin-left: -40px;
  height: 39px;
  width: 100%;

  .is-fullscreen & {
    bottom: 39px;
  }
`
const StyledCarouselButtonContainerInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  position: relative;
`

const StyledCarouselCount = styled.div`
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  justify-content: flex-end;
  border-radius: 3px;
  min-width: 44px;
  position: absolute;
  right: 100%;
  padding: 0;
  margin-right: 10px;
`

const CarouselIndicator = styled.li`
  margin: 0;
  cursor: pointer;
  border-radius: 50%;
  border: 3px solid transparent;
  position: relative;
  z-index: 1;

  > span {
    background-color: ${props => props.theme.secondaryButtonText};
    display: block;
    border-radius: 3px;
    width: 6px;
    height: 6px;
    opacity: 0.4;
    transition: opacity 0.1s ease-in-out;
  }

  &::before {
    border-radius: 2px;
    content: attr(aria-label);
    color: ${props => props.theme.primaryBackground};
    background-color: ${props => props.theme.primaryText};
    position: absolute;
    font-size: 12px;
    font-weight: bold;
    left: 50%;
    min-width: 24px;
    bottom: calc(100% + 5px);
    pointer-events: none;
    transform: translateX(-50%);
    padding: 5px;
    line-height: 1;
    text-align: center;
    z-index: 100;
    visibility: hidden;
  }

  &::after {
    border: solid;
    border-color: ${props => props.theme.primaryText} transparent;
    border-width: 6px 6px 0 6px;
    bottom: 5px;
    content: '';
    left: 50%;
    pointer-events: none;
    position: absolute;
    transform: translateX(-50%);
    z-index: 100;
    visibility: hidden;
  }

  &:hover::before,
  &:hover::after {
    visibility: visible;
  }
`
const CarouselIndicatorInactive = styled(CarouselIndicator)`
  &:hover > span {
    opacity: 1;
  }
`
const CarouselIndicatorActive = styled(CarouselIndicator)`
  > span {
    opacity: 1;
  }
`

const StyledUl = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding-left: 0 !important;
`

const WideDrawer = styled(Drawer)`
  width: 500px;
  position: relative;
  background-color: white;
`

const sidebarGuides: GuideChapter[] = [
  'allGuides',
  'intro',
  'concepts',
  'cypher',
  'movies',
  'northwind'
]

const GuideContent = styled.div`
  padding-bottom: 40px;
`

function GuideDrawer(): JSX.Element {
  const [selectedGuide, setSelectedGuide] = useState<GuideChapter>('allGuides')
  function onSelectChange(e: React.FormEvent<HTMLSelectElement>) {
    e.preventDefault()
    if (!isGuideChapter(e.currentTarget.value)) {
      throw Error('invalid select target')
    }
    setSelectedGuide(e.currentTarget.value)
  }

  return (
    <WideDrawer id="guide-drawer">
      <DrawerHeader>Neo4j Browser Guides</DrawerHeader>
      <DrawerBody>
        <select
          style={{ color: 'black' }}
          value={selectedGuide}
          onChange={onSelectChange}
        >
          {sidebarGuides.map(guideName => (
            <option key={guideName} value={guideName}>
              {guideName}
            </option>
          ))}
        </select>
        <GuideContent>
          <Carousel slides={docs.play.chapters[selectedGuide].slides} />
        </GuideContent>
      </DrawerBody>
    </WideDrawer>
  )
}
export default GuideDrawer

import Directives from 'browser-components/Directives'
import { CarouselButton } from 'browser-components/buttons'
import {
  SlidePreviousIcon,
  SlideNextIcon
} from 'browser-components/icons/Icons'
import { useRef } from 'react'

type CarouselProps = { slides?: JSX.Element[]; initialSlide?: number }
function Carousel({
  slides = [],
  initialSlide = 0
}: CarouselProps): JSX.Element {
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

  return (
    <StyledCarousel onKeyUp={onKeyUp}>
      <SlideContainer ref={scrollRef}>
        <Directives content={currentSlide} />
      </SlideContainer>
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
    </StyledCarousel>
  )
}
