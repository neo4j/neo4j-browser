/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import Slide from './Slide'
import Directives from 'browser-components/Directives'
import Carousel from './Carousel'

export default class Guides extends Component {
  constructor (props) {
    super(props)
    this.ref = React.createRef()
    this.state = { slides: null, firstRender: true }
  }
  componentDidMount () {
    if (!this.ref) return
    if (!this.ref.current) return
    console.log('this.ref.current: ', this.ref.current)
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
    if (this.state.slides && Array.isArray(this.state.slides)) {
      const ListOfSlides = this.state.slides.map(slide => {
        const slideComponent = (
          <Slide key={uuid.v4()} html={slide.html.innerHTML} />
        )
        if (this.props.withDirectives) {
          return (
            <div key={uuid.v4()}>
              <Directives content={slideComponent} />
            </div>
          )
        } else {
          return <div key={uuid.v4()}>{slideComponent}</div>
        }
      })
      return (
        <Carousel
          slides={ListOfSlides}
          withDirectives={this.props.withDirectives}
        />
      )
    }
    if (this.props.withDirectives) {
      return (
        <Directives content={<Slide ref={this.ref} html={this.props.html} />} />
      )
    } else {
      return <Slide ref={this.ref} html={this.props.html} />
    }
  }
}
