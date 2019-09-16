/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import React, { Component } from 'react'
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

export default class Carousel extends Component {
  state = {
    visibleSlide: 0,
    wasClicked: false
  }
  constructor (props) {
    super(props)
    this.slides = this.props.slides || []
    this.myRef = React.createRef()
  }
  onKeyDown (ev) {
    if (ev.keyCode === 37 && this.state.visibleSlide !== 0) {
      this.prev()
    }
    if (
      ev.keyCode === 39 &&
      this.state.visibleSlide !== this.slides.length - 1
    ) {
      this.next()
    }
  }
  next () {
    this.setState({ visibleSlide: this.state.visibleSlide + 1 })
    this.setState({ wasClicked: true })
    this.myRef.current.scrollTo(0, 0)
  }
  prev () {
    this.setState({ visibleSlide: this.state.visibleSlide - 1 })
    this.myRef.current.scrollTo(0, 0)
  }
  getSlide (slideNumber) {
    return this.slides[slideNumber]
  }
  goToSlide (slideNumber) {
    this.setState({ visibleSlide: slideNumber })
  }
  render () {
    const { showIntro, withDirectives } = this.props
    return (
      <StyledCarousel
        data-testid='carousel'
        onKeyDown={e => this.onKeyDown(e)}
        tabIndex='0'
      >
        <CarouselButton
          className={'previous-slide  rounded'}
          data-testid='previousSlide'
          disabled={this.state.visibleSlide === 0}
          onClick={this.prev.bind(this)}
        >
          <SlidePreviousIcon />
        </CarouselButton>
        <StyledCarouselButtonContainer>
          {showIntro && !this.state.wasClicked && (
            <StyledCarouselIntroAnimated className='carousel-intro-animation'>
              <StyledCarouselIntro>
                <span>Use the navigation to get started</span>
                <span>{`->`}</span>
              </StyledCarouselIntro>
            </StyledCarouselIntroAnimated>
          )}
          <StyledCarouselButtonContainerInner>
            <StyledCarouselCount>
              {`${this.state.visibleSlide + 1} / ${this.slides.length}`}
            </StyledCarouselCount>
            <CarouselButton
              className={'previous-slide'}
              disabled={this.state.visibleSlide === 0}
              onClick={this.prev.bind(this)}
            >
              <SlidePreviousIcon />
            </CarouselButton>
            <CarouselSlidePicker
              slides={this.slides}
              visibleSlide={this.state.visibleSlide}
              onClickEvent={slideNumber => this.goToSlide(slideNumber)}
            />
            <CarouselButton
              className={'next-slide'}
              disabled={this.state.visibleSlide === this.slides.length - 1}
              onClick={this.next.bind(this)}
            >
              <SlideNextIcon />
            </CarouselButton>
          </StyledCarouselButtonContainerInner>
        </StyledCarouselButtonContainer>
        <SlideContainer ref={this.myRef}>
          {withDirectives ? (
            <Directives content={this.getSlide(this.state.visibleSlide)} />
          ) : (
            this.getSlide(this.state.visibleSlide)
          )}
        </SlideContainer>
        <CarouselButton
          className={'next-slide rounded'}
          data-testid='nextSlide'
          disabled={this.state.visibleSlide === this.slides.length - 1}
          onClick={this.next.bind(this)}
        >
          <SlideNextIcon />
        </CarouselButton>
      </StyledCarousel>
    )
  }
}
