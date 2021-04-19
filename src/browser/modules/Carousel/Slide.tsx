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
import React from 'react'
// The reason we have this file is to define classnames
// used in our templates and externally defined guides
import styles from './style.less'
import { StyledSidebarSlide, StyledSlide } from './styled'

type SlideProps = {
  children?: React.ReactNode
  content?: JSX.Element
  html?: string
  isSidebarSlide?: boolean
}

const Slide = React.forwardRef(
  (
    { children, content, html, isSidebarSlide }: SlideProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const SlideComponent = isSidebarSlide ? StyledSidebarSlide : StyledSlide

    if (children) {
      return (
        <SlideComponent ref={ref} className={styles.slide}>
          {children}
        </SlideComponent>
      )
    }

    if (content) {
      return (
        <SlideComponent ref={ref} className={styles.slide}>
          {content}
        </SlideComponent>
      )
    }

    if (html) {
      return (
        <SlideComponent
          ref={ref}
          className={styles.slide}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }

    return null
  }
)

Slide.displayName = 'Slide'

export default Slide
