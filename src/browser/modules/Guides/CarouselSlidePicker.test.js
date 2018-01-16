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

/* global describe, beforeEach, afterEach, test, expect */
import { mount } from 'services/testUtils'
import CarouselSlidePicker from './CarouselSlidePicker'

describe('CarouselSlidePicker', () => {
  test('should not render is slides prop is missing', () => {
    // Given
    const result = mount(CarouselSlidePicker)
      // When
      .withProps({})
      .then(wrapper => {
        expect(wrapper.text()).toBe('')
      })
    return result
  })
  test('should render indicators if there are slides', () => {
    // Given
    const slides = ['foo', 'bar']
    const result = mount(CarouselSlidePicker)
      // When
      .withProps({ slides })
      .then(wrapper => {
        expect(wrapper.find('li').length).toBe(2)
      })
    return result
  })
  test('should render active indicators if the slide index matches the visibleSlide prop', () => {
    // Given
    const slides = ['foo', 'bar']
    const visibleSlide = 0
    const result = mount(CarouselSlidePicker)
      // When
      .withProps({ slides, visibleSlide })
      .then(wrapper => {
        expect(wrapper.find('li').length).toBe(2)
        expect(wrapper.find('li').get(0)).not.toEqual(wrapper.find('li').get(1))
      })
    return result
  })
})
