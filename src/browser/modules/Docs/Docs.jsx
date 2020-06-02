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

import React, { useState, useEffect } from 'react'
import uuid from 'uuid'
import Directives from 'browser-components/Directives'
import Carousel from '../Carousel/Carousel'
import Slide from '../Carousel/Slide'

export default function Docs({
  slides,
  content,
  html,
  withDirectives,
  initialSlide,
  onSlide,
  originFrameId,
  lastUpdate
}) {
  const [stateSlides, setStateSlides] = useState([])

  useEffect(() => {
    if (slides && slides.length) {
      setStateSlides(slides)
      return
    }
    let slide = <Slide html="" />
    if (content) {
      slide = <Slide content={content} />
    } else if (html) {
      const tmpDiv = document.createElement('div')
      tmpDiv.innerHTML = html
      const htmlSlides = tmpDiv.getElementsByTagName('slide')
      if (htmlSlides && htmlSlides.length) {
        const reactSlides = Array.from(htmlSlides).map(slide => {
          return <Slide key={uuid.v4()} html={slide.innerHTML} />
        })
        setStateSlides(reactSlides)
        return
      }
      slide = <Slide html={html} />
    }

    if (withDirectives) {
      slide = <Directives originFrameId={originFrameId} content={slide} />
    }
    setStateSlides([slide])

    if (onSlide) {
      onSlide({ hasPrev: false, hasNext: false, slideIndex: 0 })
    }
  }, [slides, content, html, withDirectives, lastUpdate])

  if (stateSlides.length > 1) {
    return (
      <Carousel
        onSlide={onSlide}
        slides={stateSlides}
        initialSlide={initialSlide}
        withDirectives={withDirectives}
        originFrameId={originFrameId}
      />
    )
  } else if (stateSlides.length) {
    return stateSlides[0]
  }
  return null
}
