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
import styled from 'styled-components'
import { dim } from 'browser-styles/constants'

import SVGInline from 'react-svg-inline'

import styles from './style.css'

export class ToolTip extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mouseover: false,
      id: props.id,
      icon: props.icon,
      name: props.tooltip,
      hidden: true
    }
  }
  onMouseEnterHandler () {
    this.setState({ mouseover: true })
  }
  onMouseLeaveHandler () {
    this.setState({ mouseover: false })
  }
  render () {
    const tooltip = null
    return (
      <div
        onMouseLeave={this.onMouseLeaveHandler.bind(this)}
        onMouseEnter={this.onMouseEnterHandler.bind(this)}
      >
        {this.props.children}
        {tooltip}
      </div>
    )
  }
}

export const CloseButton = props => {
  return <button {...props}>×</button>
}

export const EditorButton = props => {
  const { icon, title, ...rest } = props
  return (
    <BaseButton title={title}>
      {
        <SVGInline
          svg={icon}
          accessibilityLabel={title}
          {...rest}
          width='24px'
        />
      }
    </BaseButton>
  )
}
const BaseButton = styled.span`
  font-family: ${props => props.theme.streamlineFontFamily};
  font-style: normal !important;
  font-weight: 400 !important;
  font-variant: normal !important;
  text-transform: none !important;
  speak: none;
  -webkit-font-smoothing: antialiased;
  color: ${props => props.theme.secondaryButtonText};
  background-color: ${props => props.theme.secondaryButtonBackground};
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 28px;
  line-height: 28px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  vertical-align: middle;
  display: inline-block;
`

export const EditModeEditorButton = styled(EditorButton)`
  color: ${props => props.theme.editModeButtonText};
`

export const StyledNavigationButton = styled.button`
  background: transparent;
  border: 0;
  width: 80px;
  line-height: 67px;
  padding-top: 3px;
  font-size: 28px;
  &:focus {
    outline: none;
  }
`
export const NavigationButtonContainer = styled.li`
  min-height: 70px;
  height: 70px;
  background-color: ${props =>
    !props.isOpen ? 'transparent' : props.theme.drawerBackground};
  &:focus {
    outline: none;
  }
`

const StyledFormButton = styled.button`
  color: ${props => props.theme.secondaryButtonText};
  background-color: ${props => props.theme.secondaryButtonBackground};
  border: ${props => props.theme.secondaryButtonBorder};
  font-family: ${props => props.theme.primaryFontFamily};
  padding: 6px 12px;
  font-weight: 400;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  border-radius: 4px;
  line-height: 20px;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.secondaryButtonTextHover};
    border: ${props => props.theme.secondaryButtonBorderHover};
  }
`

const StyledSecondaryFormButton = styled(StyledFormButton)`
  color: ${props => props.theme.secondaryButtonText};
  border: ${props => props.theme.secondaryButtonBorder};
  background-color: ${props => props.theme.secondaryButtonBackground};
  &:hover {
    color: ${props => props.theme.secondaryButtonTextHover};
    border: ${props => props.theme.secondaryButtonBorderHover};
    background-color: ${props => props.theme.secondaryButtonBackground};
  }
`

export const StyledErrorBoundaryButton = styled(StyledFormButton)`
  color: #da4433;
  border: 1px solid #da4433;
  background-color: #fbf1f0;
  &:hover {
    color: #ff4433;
    border: 1px solid #ff4433;
    background-color: #fbf1f0;
  }
`
const StyledDrawerFormButton = styled(StyledSecondaryFormButton)`
  color: #bcc0c9;
  border-color: #bcc0c9;
  outline: none;
  &:hover {
    color: #ffffff;
    border-color: #ffffff;
  }
`

const buttonTypes = {
  primary: StyledFormButton,
  secondary: StyledSecondaryFormButton,
  drawer: StyledDrawerFormButton
}

export const FormButton = props => {
  const { icon, label, children, ...rest } = props
  const ButtonType = buttonTypes[props.buttonType] || buttonTypes.primary

  if (icon && label) {
    return (
      <ButtonType {...rest} type='button'>
        {label} {icon}
      </ButtonType>
    )
  }
  if (icon) {
    return (
      <ButtonType {...rest} type='button'>
        {icon}
      </ButtonType>
    )
  }
  if (label) {
    return (
      <ButtonType {...rest} type='button'>
        {label}
      </ButtonType>
    )
  }
  return (
    <ButtonType {...props} type='button'>
      {children}
    </ButtonType>
  )
}

export const CypherFrameButton = props => {
  const { selected, ...rest } = props
  return selected ? (
    <StyledSelectedCypherFrameButton {...rest} />
  ) : (
    <StyledCypherFrameButton {...rest} />
  )
}

const StyledCypherFrameButton = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  border-bottom: ${props => props.theme.inFrameBorder};
  height: 58px;
  font-size: 21px !important;
  line-height: 21px;
  padding-top: 12px;
  vertical-align: bottom;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.secondaryButtonTextHover};
    fill: ${props => props.theme.secondaryButtonTextHover};
    text-decoration: none;
  }
`
const StyledSelectedCypherFrameButton = styled(StyledCypherFrameButton)`
  background-color: ${props => props.theme.secondaryButtonBackgroundHover};
  color: ${props => props.theme.secondaryButtonTextHover};
  fill: ${props => props.theme.secondaryButtonTextHover};
`
export const FrameButton = props => {
  const { pressed, children, ...rest } = props
  return pressed ? (
    <StyledFrameButtonPressed {...rest}>{children}</StyledFrameButtonPressed>
  ) : (
    <StyledFrameButton {...rest}>{children}</StyledFrameButton>
  )
}
const StyledFrameButton = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  border-left: ${props => props.theme.inFrameBorder};
  height: ${dim.frameTitlebarHeight}px;
  width: 41px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 40px;
  display: inline-block;
  &:hover {
    background-color: ${props => props.theme.secondaryButtonBackgroundHover};
    color: ${props => props.theme.secondaryButtonTextHover};
    fill: ${props => props.theme.secondaryButtonTextHover};
    text-decoration: none;
  }
`

export const StyledStatusSection = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  height: ${dim.frameTitlebarHeight}px;
  width: 41px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 40px;
  display: inline-block;
  &:hover {
    text-decoration: none;
  }
`
const StyledFrameButtonPressed = styled(StyledFrameButton)`
  background-color: ${props => props.theme.secondaryButtonBackgroundHover};
  color: ${props => props.theme.secondaryButtonTextHover};
  fill: ${props => props.theme.secondaryButtonTextHover};
`
export const DefaultA = styled.a`
  color: ${props => props.theme.secondaryButtonText};
  &:hover {
    color: ${props => props.theme.secondaryBackground};
    text-decoration: none;
  }
`
export const FrameButtonAChild = styled(DefaultA)`
  display: block;
  text-decoration: none;
  &:focus,
  &:active,
  &:hover {
    outline: 0;
    text-decoration: none;
  }
`

export const ActionButton = props => {
  const { className, ...rest } = props
  return <button className={className + ' ' + styles.action} {...rest} />
}

const BaseCarouselButton = styled.button`
  order: 1;
  background-color: rgb(34, 34, 34);
  border: 3px solid rgb(255, 255, 255);
  color: rgb(255, 255, 255);
  cursor: pointer;
  margin: 0 20px;
  font-family: ${props => props.theme.primaryFontFamily};
  font-size: 60px;
  font-weight: 100;
  height: 40px;
  min-height: 40px;
  border-radius: 50%;
  line-height: 0;
  opacity: 0.5;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-shadow: rgba(0, 0, 0, 0.6) 0px 1px 2px;
  top: 130px;
  width: 40px;
  min-width: 40px;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  &:hover {
    color: #fff;
    text-decoration: none;
    filter: alpha(opacity=90);
    outline: 0;
    opacity: 0.9;
  }
  &:focus {
    outline: none;
  }
`
const CarouselButtonOverlay = styled.span`
  position: absolute;
  top: 13px;
  left: 9px;
`
export const CarouselButton = props => {
  const { children, ...rest } = props
  return (
    <BaseCarouselButton {...rest}>
      <CarouselButtonOverlay>{children}</CarouselButtonOverlay>
    </BaseCarouselButton>
  )
}

export const StyledLink = styled.a`
  cursor: pointer;
  text-decoration: none;
  &:hover {
    color: #5dade2;
    text-decoration: none;
  }
`

export const SyncSignInButton = styled(FormButton)`
  background-color: #5fb434;
  color: #ffffff;
  &:hover {
    background-color: ${props => props.theme.formButtonBackgroundHover};
    color: #797979;
  }
`
