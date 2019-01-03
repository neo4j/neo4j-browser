/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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

import styled from 'styled-components'

export const StyledCarousel = styled.div``
export const SlideContainer = styled.div`
  padding: 0 60px;
  width: 100%;
  display: inline-block;
`
export const StyledCarouselLeft = styled.div`
  float: left;
`
export const StyledCarouselRight = styled.div`
  float: right;
`
export const StyledCarouselButtonContainer = styled.div`
  margin-top: -40px;
`
const CarouselIndicator = styled.li`
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 1px;
  text-indent: -999px;
  cursor: pointer;
  background-color: transparent;
  border: 1px solid #fff;
  border-radius: 10px;
  cursor: pointer;
  background-color: rgba(188, 195, 207, 0.64);
`
export const CarouselIndicatorInactive = styled(CarouselIndicator)`
  &:hover {
    background-color: rgba(188, 195, 207, 1);
  }
`
export const CarouselIndicatorActive = styled(CarouselIndicator)`
  width: 12px;
  height: 12px;
  background-color: #428bca;
`
export const StyledUl = styled.ul`
  margin: 15px;
`

export const StyledSlide = styled.div`
  color: ${props => props.theme.primaryText};
  & p.lead,
  .title,
  .subtitle,
  .content > p,
  .table-help {
    color: ${props => props.theme.primaryText} !important;
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
  .code {
    background-color: transparent;
  }
`
