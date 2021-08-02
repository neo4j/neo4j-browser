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
import styled, { StyledComponent } from 'styled-components'
import { dim } from 'browser-styles/constants'

import SVGInline from 'react-svg-inline'

import { hexToRgba } from '../../styles/utils'

import styles from './style.css'

export const CloseButton = (props: any): JSX.Element => {
  return <button {...props}>×</button>
}

export const EditorButton = (props: any): JSX.Element => {
  const { icon, title, color, width, onClick, ...rest } = props
  const overrideColor = { ...(color ? { color } : {}) }
  return (
    <BaseButton onClick={onClick} title={title} style={overrideColor}>
      <SVGInline
        svg={icon}
        accessibilityLabel={title}
        {...rest}
        width={`${width}px`}
      />
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
  width: ${dim.frameButtonWidth}px;
  height: 39px;
  font-size: 28px;
  line-height: 28px;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  vertical-align: middle;
  display: inline-block;
  flex-shrink: 0; // Prevents button from shrinking in safari
  &:hover {
    opacity: 0.55;
  }
`

export const StyledCannyBadgeAnchor = styled.div`
  pointer-events: none;

  .Canny_BadgeContainer {
    pointer-events: none;

    .Canny_Badge {
      pointer-events: none;
      top: 10px;
      right: 10px;
      border-radius: 10px;
      background-color: #df4d3b;
      padding: 4px;
      border: 1px solid #df4d3b;
    }
  }
`

export const StyledNavigationButton = styled.button`
  background: transparent;
  border: 0;
  width: 60px;
  line-height: 67px;
  padding-top: 3px;
  font-size: 28px;
  &:focus {
    outline: none;
  }
`

export const NavigationButtonContainer = styled.li<{ isOpen: boolean }>`
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
  background-color: ${props => props.theme.primary};
  border: 1px solid ${props => props.theme.primary};
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
    background-color: ${props => props.theme.primary50};
    color: ${props => props.theme.secondaryButtonTextHover};
    border: 1px solid ${props => props.theme.primary50};
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
const StyledDestructiveButton = styled(StyledFormButton)`
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

const buttonTypes: Record<string, StyledComponent<'button', any, {}, never>> = {
  primary: StyledFormButton,
  secondary: StyledSecondaryFormButton,
  drawer: StyledDrawerFormButton,
  destructive: StyledDestructiveButton,
  tag: StyledTagButton
}

interface ButtonTypeProps {
  buttonType?: string
  icon?: JSX.Element
  label?: string
  children?: any
  tabIndex?: any
  onClick?: any
  type?: any
  style?: any
  disabled?: any
  className?: any
}

export const FormButton = (props: ButtonTypeProps): JSX.Element => {
  const { icon, label, children, ...rest } = props
  const ButtonType =
    buttonTypes[props.buttonType as string] || buttonTypes.primary

  if (icon && label) {
    return (
      <ButtonType type="button" {...rest}>
        {label} {icon}
      </ButtonType>
    )
  }
  if (icon) {
    return (
      <ButtonType type="button" {...rest}>
        {icon}
      </ButtonType>
    )
  }
  if (label) {
    return (
      <ButtonType type="button" {...rest}>
        {label}
      </ButtonType>
    )
  }
  return (
    <ButtonType type="button" {...props}>
      {children}
    </ButtonType>
  )
}

export const CypherFrameButton = (props: any): JSX.Element => {
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
  border-bottom: 1px transparent;
  height: 58px;
  font-size: 21px !important;
  line-height: 21px;
  padding-top: 12px;
  vertical-align: bottom;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  fill: ${props => props.theme.secondaryButtonText};
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

type FrameButtonProps = {
  onClick: () => void
  children: React.ReactNode
  title: string
}

export const FrameButton = ({
  onClick,
  children,
  title
}: FrameButtonProps): JSX.Element => (
  <StyledFrameButton onClick={onClick} title={title}>
    {children}
  </StyledFrameButton>
)

type FrameControlButtonProps = {
  pressed?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}

export const FrameControlButton = ({
  title,
  pressed,
  onClick,
  children
}: FrameControlButtonProps): JSX.Element => (
  <StyledFrameControlButton title={title} pressed={pressed} onClick={onClick}>
    {children}
  </StyledFrameControlButton>
)

const StyledFrameControlButton = styled.li<{
  pressed?: boolean
}>`
  border-radius: 2px;
  color: ${props =>
    props.pressed
      ? props.theme.secondaryButtonTextHover
      : props.theme.frameControlButtonTextColor};
  background-color: ${props =>
    props.pressed ? props.theme.frameButtonHoverBackground : 'transparent'};

  border-left: transparent;
  height: 20px;
  width: 20px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 20px;
  display: inline-block;
  margin-left: 12px;
  &:hover {
    background-color: ${props => props.theme.frameButtonHoverBackground};
    color: ${props => props.theme.secondaryButtonTextHover};
    fill: ${props => props.theme.secondaryButtonTextHover};
    text-decoration: none;
  }
`

export const StyledFrameButton = styled.li`
  color: ${props => props.theme.frameButtonTextColor};
  background-color: transparent;
  border-left: transparent;
  height: ${dim.frameTitlebarHeight}px;
  width: ${dim.frameButtonWidth}px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: ${dim.frameTitlebarHeight}px;
  display: inline-block;

  &:hover {
    background-color: ${props => props.theme.frameButtonHoverBackground};
    color: ${props => props.theme.secondaryButtonTextHover};
    fill: ${props => props.theme.secondaryButtonTextHover};
    text-decoration: none;
  }
`

export const StyledStatusSection = styled.li`
  color: ${props => props.theme.secondaryButtonText};
  background-color: transparent;
  height: ${dim.frameTitlebarHeight}px;
  width: ${dim.frameButtonWidth}px;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  line-height: 40px;
  display: inline-block;
  &:hover {
    text-decoration: none;
  }
`

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
    background-color: ${props => hexToRgba(props.theme.frameCommandBackground)};
    border-radius: 0 2px 2px 0;
    position: absolute;
    left: 0;
    top: 0px;
    bottom: 0px;
    height: auto;
    width: 32px;
    margin-bottom: 39px;

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

export const CarouselButton = (props: any): JSX.Element => {
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
