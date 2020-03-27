/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import styled from 'styled-components'
import { dim } from 'browser-styles/constants'

import SVGInline from 'react-svg-inline'

import { hexToRgba } from '../../styles/utils'

import styles from './style.css'

export const CloseButton = props => {
  return <button {...props}>×</button>
}

export const EditorButton = props => {
  const { icon, title, ...rest } = props
  return (
    <BaseButton title={title}>
      <SVGInline svg={icon} accessibilityLabel={title} {...rest} width="24px" />
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
  color: ${props => props.theme.primaryButtonText};
  background-color: ${props => props.theme.primaryButtonBackground};
  border: 1px solid ${props => props.theme.primaryButtonBackground};
  font-family: ${props => props.theme.primaryFontFamily};
  padding: 6px 18px;
  margin-right: 10px;
  font-weight: 600;
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
    border: 1px solid ${props => props.theme.secondaryButtonBackgroundHover};
  }
`

const StyledTagButton = styled(StyledFormButton)`
  background-color: ${props => props.theme.secondaryButtonBackgroundHover};
  color: ${props => props.theme.secondaryButtonTextHover};
  border: 1px solid ${props => props.theme.secondaryButtonBackgroundHover};
  font-weight: 400;
  padding: 6px 30px 6px 12px;
  position: relative;
  text-align: left;

  > i {
    background-color: ${props => props.theme.primaryButtonText};
    border-radius: 50%;
    color: ${props => props.theme.secondaryButtonBackgroundHover};
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;

    > span {
      display: inline-block;
      vertical-align: middle;
    }

    svg {
      display: block;
      width: 8px !important;
      height: 8px !important;
    }

    line {
      stroke-width: 4px;
    }
  }

  &:hover {
    > i {
      color: ${props => props.theme.secondaryButtonBackgroundHover};
    }
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
export const StyledDestructiveButton = styled(StyledFormButton)`
  color: #fff;
  border: 1px solid #da4433;
  background-color: #da4433;
  &:hover {
    color: #fff;
    border: 1px solid #da4433;
    background-color: #da4433;
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
  drawer: StyledDrawerFormButton,
  destructive: StyledDestructiveButton,
  tag: StyledTagButton
}

export const FormButton = props => {
  const { icon, label, children, ...rest } = props
  const ButtonType = buttonTypes[props.buttonType] || buttonTypes.primary

  if (icon && label) {
    return (
      <ButtonType {...rest} type="button">
        {label} {icon}
      </ButtonType>
    )
  }
  if (icon) {
    return (
      <ButtonType {...rest} type="button">
        {icon}
      </ButtonType>
    )
  }
  if (label) {
    return (
      <ButtonType {...rest} type="button">
        {label}
      </ButtonType>
    )
  }
  return (
    <ButtonType {...props} type="button">
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
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 28px;
  width: 28px;
  padding: 0;
  border: 0;
  user-select: none;
  outline: none;

  &.rounded {
    background-color: ${props =>
      hexToRgba(props.theme.secondaryButtonText, 0.1)};
    border-radius: 0 5px 5px 0;
    position: absolute;
    left: 0;
    top: 20px;
    bottom: 59px;
    height: auto;
    width: 32px;

    i {
      margin-right: 3px;
    }

    &.next-slide {
      border-radius: 5px 0 0 5px;
      left: auto;
      right: 0;

      i {
        margin-left: 3px;
        margin-right: 0;
      }
    }

    .is-fullscreen & {
      top: calc(50% - 20px);
      bottom: auto;
      height: 50%;
      max-height: 420px;
      transform: translateY(-50%);
    }
  }

  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  &.previous-slide {
    margin-right: 0.5rem;

    &:hover {
      svg {
        transform: translateX(-2px);
        transition: transform 0.2s ease-in-out;
      }
    }
  }
  &.next-slide {
    margin-left: 0.5rem;

    &:hover {
      svg {
        transform: translateX(2px);
        transition: transform 0.2s ease-in-out;
      }
    }
  }

  i,
  span {
    display: flex;
  }
`

export const CarouselButton = props => {
  const { children, ...rest } = props
  return <BaseCarouselButton {...rest}>{children}</BaseCarouselButton>
}

export const StyledLink = styled.a`
  color: ${props => props.theme.link};
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
