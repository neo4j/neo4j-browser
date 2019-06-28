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
import uuid from 'uuid'
import Directives from 'browser-components/Directives'
import Carousel from '../Carousel/Carousel'
import Slide from '../Carousel/Slide'

export default class Guides extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = { slides: null, firstRender: true }
  }

  componentDidMount () {
    if (!this.ref) return
    if (!this.ref.current) return
    const slides = this.ref.current.getElementsByTagName('slide')
    let reactSlides = this
    if (slides.length > 0) {
      reactSlides = Array.from(slides).map(slide => {
        return {
          html: slide
        }
      })
    }
    this.setState({ slides: reactSlides, firstRender: false })
  }

  render () {
    const { content, html, withDirectives, hasCarouselComponent } = this.props

    if (hasCarouselComponent) {
      return content
    }

    if (this.state.slides && Array.isArray(this.state.slides)) {
      const ListOfSlides = this.state.slides.map(slide => {
        return <Slide key={uuid.v4()} html={slide.html.innerHTML} />
      })
      return <Carousel slides={ListOfSlides} withDirectives={withDirectives} />
    }

    let slide = <Slide ref={this.ref} html={''} />
    if (content) {
      slide = <Slide ref={this.ref} content={content} />
    } else if (html) {
      slide = <Slide ref={this.ref} html={html} />
    }

    if (withDirectives) {
      return <Directives content={slide} />
    } else {
      return slide
    }
  }
}
