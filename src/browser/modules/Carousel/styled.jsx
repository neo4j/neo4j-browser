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

export const StyledCarousel = styled.div``
export const SlideContainer = styled.div`
  padding: 0 60px;
  width: 100%;
  display: inline-block;
`
export const StyledCarouselLeft = styled.div`
  &.is-hidden {
    pointer-events: none;
    /* visibility: hidden; */
  }
`
export const StyledCarouselRight = styled.div`
  &.is-hidden {
    pointer-events: none;
    /* visibility: hidden; */
  }
`

export const StyledCarouselButtonContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
`
const CarouselIndicator = styled.li`
  width: 8px;
  height: 8px;
  margin: 0 3px;
  cursor: pointer;
  border-radius: 50%;
  cursor: pointer;
  background-color: rgba(20, 20, 20, 0.5);
`
export const CarouselIndicatorInactive = styled(CarouselIndicator)`
  &:hover {
    background-color: rgba(20, 20, 20, 0.9);
    transform: scale(1.2);
  }
`
export const CarouselIndicatorActive = styled(CarouselIndicator)`
  background-color: #428bca;
  border: 0;
  transform: scale(1.2);
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
