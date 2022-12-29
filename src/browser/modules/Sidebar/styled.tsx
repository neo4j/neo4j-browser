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
import styled from 'styled-components'

import { LARGE_DRAWER_WIDTH } from 'browser-components/TabNavigation/Navigation'
import {
  DrawerBody,
  DrawerBrowserCommand
} from 'browser-components/drawer/drawer-styled'
import { dark } from 'browser-styles/themes'

export const StyledSetting = styled.div`
  padding-bottom: 5px;
  padding-top: 5px;
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
  }
`

export const StyledCommandRowWrapper = styled.div`
  display: flex;
`

export const FlexSpacer = styled.div`
  flex: 1 1 auto;
`

export const StyledCommandRunButton = styled.button<{ hidden?: boolean }>`
  color: ${props => props.theme.primary};
  background-color: transparent;
  border: none;
  display: ${props => (props.hidden ? 'none' : 'block')};

  svg {
    display: inline-block;
    vertical-align: middle;
  }
`

export const StyledCommandNamePair = styled.div`
  flex: 0 0 auto;
  margin: 0px 0px 0px 24px;
  padding: 10px 0;
  display: flex;
  width: 85%;
`
export const StyledName = styled.div`
  width: 50%;
  margin-right: 5px;
`

export const StyledFullSizeDrawerBody = styled(DrawerBody)`
  padding: 0 0 12px 0;
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

export const StyledFeedbackButton = styled.button`
  background: #55acee;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: fit-content;
  margin: 0 0 25px 25px;
  min-height: fit-content;
  outline: 0;
  border: none;
  vertical-align: baseline;
  font-family: 'Open Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif;
  padding: 0.78571429em 1.5em 0.78571429em;
  font-size: 1rem;
  line-height: 1em;
  border-radius: 0.28571429rem;

  :hover {
    background-color: #35a2f4;
  }

  :active {
    background-color: #2795e9;
  }
`

export const StyledCommand = styled(DrawerBrowserCommand)`
  max-width: 45%;
`

export const StyledCarousel = styled.div`
  width: 100%;
  outline: none;
  flex: 1;
  overflow: auto;

  div:first-child {
    overflow: auto;
    max-height: calc(100% - 50px);
  }

  .row {
    margin-left: 0;
    margin-right: 0;
  }

  .paragraph {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  img {
    background-color: #fff;
  }

  ul {
    margin: 16px 0 16px 16px;
    list-style: initial;
  }

  li > p {
    display: inline !important;
  }

  ol > p {
    display: inline !important;
  }

  ol {
    margin: 16px 0 16px 16px;
    list-style: numeric;
  }

  .imageblock {
    padding: 3px;
  }

  pre.code.runnable {
    background-color: rgba(255, 255, 255, 0.1);
    padding-left: 22px !important; /* counteracts another important.. */
  }

  pre > .fa.fa-play-circle-o {
    margin-left: -15px;
  }

  .content img {
    max-width: 100%;
  }
`

export const GuideUl = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 !important;
  padding-left: 0 !important;
`

export const StyledGuideDrawer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  position: relative;
`

export const StyledGuideDrawerHeader = styled.h4`
  color: ${props => props.theme.primaryHeaderText};
  background-color: ${props => props.theme.drawerBackground};
  font-size: 18px;
  padding: 25px 0 0 18px;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  text-shadow: rgba(0, 0, 0, 0.4) 0px 1px 0px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const GuideTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 2em;
  line-height: normal;
  padding: 0 15px;
  margin-bottom: 10px;
  font-family: ${props => props.theme.drawerHeaderFontFamily};
`

export const BackIconContainer = styled.span`
  cursor: pointer;
  margin-right: 5px;
`

export const GuideNavContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;

  color: ${props => props.theme.secondaryButtonText};
  background-color: ${dark.secondaryBackground};

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 40px;
  padding: 0 18px;

  z-index: 10;
  border-top: ${props => props.theme.drawerSeparator};
`

export const GuideNavButton = styled.button`
  border: none;
  background-color: inherit;
  font-size: 1.2em;
  color: ${props => props.theme.neo4jBlue};
  outline: none;
  padding: 5px 0;

  :disabled {
    opacity: 0;
  }

  :hover {
    color: ${props => props.theme.darkBlue};
  }
`

export const GuideProgressContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const StyledDrawerSeparator = styled.div`
  margin: 0 18px 18px 18px;
  border-bottom: 1px solid #424650;
`
