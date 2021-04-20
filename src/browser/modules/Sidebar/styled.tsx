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
import { Button } from 'semantic-ui-react'
import styled from 'styled-components'
import {
  DrawerBody,
  DrawerBrowserCommand
} from 'browser-components/drawer/drawer-styled'
import { dark } from 'browser-styles/themes'
import { LARGE_DRAWER_WIDTH } from 'browser-components/TabNavigation/Navigation'

export const StyledSetting = styled.div`
  padding-bottom: 15px;
`

export const StyledSettingLabel = styled.label`
  word-wrap: break-wrap;
  display: inline-block;
`
export const StyledErrorListContainer = styled.div`
  margin-left: 24px;
  color: #ffaf00;
`

export const StyledSettingTextInput = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

export const StyledHelpItem = styled.li`
  list-style-type: none;
  margin: 8px 24px 0 24px;
`

export const StyledCommandListItem = styled.li`
  list-style-type: none;
  cursor: pointer;
  text-decoration: none;
  -webkit-text-decoration: none;
  position: relative;

  &:hover {
    background-color: ${props => props.theme.hoverBackground};

    &:after {
      content: ' ';
      position: absolute;
      top: 15px;
      right: 5px;
      background-image: url("data:image/svg+xml;utf8,<svg fill='none' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M12.7791 6.65634C13.3966 7.04929 13.3966 7.95071 12.7791 8.34366L4.64174 13.522C3.97601 13.9456 3.10486 13.4674 3.10486 12.6783L3.10486 2.32167C3.10486 1.53258 3.97601 1.05437 4.64173 1.47801L12.7791 6.65634Z'  stroke='%2368BDF4' stroke-linejoin='round' /></svg>");
      height: 15px;
      width: 15px;
    }
  }
`

export const StyledCommandNamePair = styled.div`
  margin: 0px 24px;
  padding: 10px 0;
  display: flex;
`
export const StyledName = styled.div`
  width: 50%;
  margin-right: 5%;
`

export const StyledFullSizeDrawerBody = styled(DrawerBody)`
  padding: 0;
`

export const StyledHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;

  a {
    cursor: pointer;
    margin-right: 10px;

    .Canny_BadgeContainer .Canny_Badge {
      position: absolute;
      top: -1px;
      right: -1px;
      border-radius: 10px;
      background-color: #df4d3b;
      padding: 4px;
      border: 1px solid #df4d3b;
    }
  }
`

// important to override semantic UI styles
export const StyledFeedbackButton = styled(Button)`
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  max-width: fit-content !important;
  margin: 0 0 25px 25px !important;
  min-height: fit-content !important;
`

export const StyledCommand = styled(DrawerBrowserCommand)`
  max-width: 45%;
`

export const StyledCarousel = styled.div`
  height: 100%;
  padding-bottom: 20px;
  width: 100%;
  outline: none;

  .row {
    margin-left: 0;
    margin-right: 0;
  }
`

export const SlideContainer = styled.div`
  padding: 0;
  width: 100%;
  display: inline-block;
`

export const StyledCarouselButtonContainer = styled.div`
  color: ${props => props.theme.secondaryButtonText};
  background-color: ${dark.secondaryBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 60px;
  width: 500px;

  z-index: 10;
  border-top: ${props => props.theme.drawerSeparator};
  height: 40px;
`

export const StyledCarouselButtonContainerInner = styled.div`
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
  border-radius: 3px;
  min-width: 44px;
  position: absolute;
  right: 100%;
  padding: 0;
  margin-right: 10px;
`

export const CarouselIndicator = styled.li`
  margin: 0;
  cursor: pointer;
  border-radius: 50%;
  border: 3px solid transparent;
  position: relative;
  z-index: 1;

  > span {
    background-color: ${props => props.theme.secondaryButtonText};
    display: block;
    border-radius: 3px;
    width: 6px;
    height: 6px;
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
    z-index: 100;
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
    z-index: 100;
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

export const StyledUl = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding-left: 0 !important;
`

export const StyledGuidesDrawer = styled.div`
  min-height: 100vh;
  position: relative;
  width: ${LARGE_DRAWER_WIDTH}px;
  /* width is set to avoid squashing during opening animation */
`

export const StyledGuidesDrawerHeader = styled.h4`
  color: ${props => props.theme.primaryHeaderText};
  background-color: ${props => props.theme.drawerBackground};
  font-size: 18px;
  padding: 25px 0 0 25px;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
  cursor: pointer;
`

export const GuideTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 2em;
  line-height: normal;
  padding: 0 18px;
  margin-bottom: 10px;
`

export const BackIconContainer = styled.span`
  cursor: pointer;
  margin-right: 5px;
`
export const CarouselWrapper = styled.div`
  padding: 0 18px;
`

export const GuideButtonContainers = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  padding-right: 18px;
  margin-bottom: 40px;
`

export const GuideNavButton = styled.button`
  border: none;
  background-color: inherit;
  font-size: 1.2em;
  color: ${props => props.theme.link};
  outline: none;
  padding: 5px 0;

  :disabled {
    opacity: 0;
  }
`

export const StyledDrawerSeparator = styled.div`
  margin: 0 18px 18px 18px;
  border-bottom: 1px solid #424650;
`
