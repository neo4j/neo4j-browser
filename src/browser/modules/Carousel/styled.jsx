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

import styled from 'styled-components'
import { hexToRgba } from 'browser-styles/utils'
import { bounceLeft } from 'browser-styles/animations'

export const StyledCarousel = styled.div``
export const SlideContainer = styled.div`
  padding: 0 60px;
  width: 100%;
  display: inline-block;
`

export const StyledCarouselButtonContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 3rem;
  margin-right: -15px;
`
export const StyledCarouselButtonContainerInner = styled.div`
  background-color: ${props => props.theme.primaryBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  position: relative;
`

const CarouselIndicator = styled.li`
  box-sizing: content-box;
  width: 4px;
  height: 4px;
  margin: 0;
  cursor: pointer;
  border-radius: 50%;
  cursor: pointer;
  background-color: ${props => hexToRgba(props.theme.primaryText, 0.2)};
  border: 3px solid;
  border-color: ${props => props.theme.primaryBackground};
`
export const CarouselIndicatorInactive = styled(CarouselIndicator)`
  &:hover {
    background-color: ${props => props.theme.primaryText};
    transform: scale(1.2);
  }
`
export const CarouselIndicatorActive = styled(CarouselIndicator)`
  background-color: ${props => props.theme.primaryText};
  transform: scale(1.2);
`

export const StyledCarouselIntroAnimated = styled.div`
  align-items: center;
  animation: ${bounceLeft} 4s ease-in-out infinite;
  animation-fill-mode: forwards;
  color: #222;
  display: flex;
  position: absolute;
  right: 110%;
`

export const StyledCarouselIntro = styled.div`
  align-items: center;
  background-color: #f6e58d;
  border-radius: 20px;
  color: #222;
  display: flex;
  font-family: 'Fira Code', 'Monaco', 'Lucida Console', Courier, monospace;
  font-size: 10px;
  font-weight: 500;
  padding: 3px 10px;
  user-select: none;
  white-space: nowrap;

  span:first-child {
    min-width: 140px;
  }

  span:last-child {
    margin-left: 5px;
  }

  /* @media (min-width: 700px) {
    display: flex;
    span:last-child {
      min-width: 120px;
    }
  }

  @media (min-width: 850px) {
    span:last-child {
      white-space: nowrap;
    }
  } */
`

export const StyledUl = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding-left: 0 !important;
`

export const StyledSlide = styled.div`
  color: ${props => props.theme.primaryText};
  & p.lead,
  .title,
  .subtitle,
  .content > p,
  .table-help {
    color: ${props => props.theme.primaryText} !important;
    line-height: 1.7;

    th {
      padding-right: 10px;
      text-align: left;
    }

    &--keys {
      th {
        border-bottom: ${props => props.theme.topicBorder};
      }
      td {
        padding: 3px 10px 3px 0;
      }
    }
  }
  & a {
    color: ${props => props.theme.link};
    text-decoration: ${props =>
    props.theme.name === 'dark' ? 'underline' : 'none'};
  }
  & kbd {
    color: ${props => props.theme.primaryBackground} !important; /* inverted */
    background-color: ${props => props.theme.primaryText} !important;
  }
  & .content > pre {
    background-color: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.preText};
  }
  & pre.runnable {
    background-color: ${props => props.theme.preBackground};
    color: ${props => props.theme.preText};
  }
  & pre.content {
    background-color: ${props => props.theme.secondaryBackground};
    color: ${props => props.theme.preText};
  }
  & a[help-topic],
  a[play-topic],
  a[server-topic],
  a[exec-topic] {
    background-color: ${props => props.theme.topicBackground} !important;
    color: ${props => props.theme.topicText} !important;
  }
  & button [help-topic],
  button [play-topic],
  button [server-topic],
  button [exec-topic] {
    background-color: ${props => props.theme.primaryButtonBackground};
    color: ${props => props.theme.primaryButtonText};
  }
  &.slide .code {
    background-color: transparent;
  }
`
