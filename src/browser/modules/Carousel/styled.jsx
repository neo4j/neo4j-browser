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
import { bounceRight } from 'browser-styles/animations'

export const StyledCarousel = styled.div`
  position: relative;
  padding-top: 6px;
`

export const SlideContainer = styled.div`
  padding: 0;
  width: 100%;
  display: inline-block;
  max-height: 420px;
  overflow-y: auto;
`

export const StyledCarouselButtonContainer = styled.div`
  color: ${props => props.theme.secondaryButtonText};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: absolute;
  right: -30px;
  top: -30px;
  z-index: 10;
  transition: transform 0.2s ease-in-out;
  border-left: ${props => props.theme.inFrameBorder};
  border-bottom: ${props => props.theme.inFrameBorder};
`
export const StyledCarouselButtonContainerInner = styled.div`
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  position: relative;
`

export const StyledCarouselCount = styled.div`
  display: flex;
  align-items: center;
  font-size: 10px;
  font-weight: bold;
  justify-content: flex-end;
  height: 26px;
  border-radius: 3px;
  position: relative;
  padding: 0 10px 0 15px;
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
    border-radius: 2px;
    width: 4px;
    height: 4px;
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
    z-index: 1000;
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
    z-index: 1000;
    visibility: hidden;
  }

  &:hover::before,
  &:hover::after {
    visibility: visible;
  }
`
export const CarouselIndicatorInactive = styled(CarouselIndicator)`
  &:hover > span {
    opacity: 1;
  }
`
export const CarouselIndicatorActive = styled(CarouselIndicator)`
  > span {
    opacity: 1;
  }
`

export const StyledCarouselIntroAnimated = styled.div`
  align-items: center;
  animation: ${bounceRight} 4s ease-in-out infinite;
  animation-fill-mode: forwards;
  color: #222;
  display: flex;
  opacity: 0.8;
  position: absolute;
  right: calc(100% + 20px);
  bottom: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
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
    margin-right: 5px;
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

    &--header {
      th {
        border-bottom: ${props => props.theme.topicBorder};
        font-size: 2rem;
        padding: 15px 0 0 0;
      }

      &:first-child {
        th {
          padding-top: 0;
        }
      }
    }

    &--commands {
      td {
        padding: 3px 10px 3px 0;
      }
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

  .has-carousel & {
    overflow: visible;
  }
`
