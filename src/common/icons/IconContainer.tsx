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
import React, { ReactNode } from 'react'
import SVGInline from 'react-svg-inline'
import styled, {
  CSSProperties,
  FlattenSimpleInterpolation
} from 'styled-components'

const StyledIconWrapper = ({
  activeStyle,
  inactiveStyle,
  isOpen,
  children,
  ...rest
}: Exclude<
  IconContainerProps,
  'text' | 'fontSize' | 'icon' | 'width' | 'title'
>) => {
  const I = styled.i`
    ${isOpen ? activeStyle : inactiveStyle};
    &:hover {
      ${activeStyle};
    }
  `
  return <I {...rest}>{children}</I>
}

const StyledText = styled.div`
  font-size: 9px;
  line-height: 10px;
  margin-top: 4px;
  padding: 0;
`

type IconContainerProps = {
  activeStyle?: string | FlattenSimpleInterpolation
  icon?: string
  inactiveStyle?: string
  isOpen?: boolean
  text?: string
  title?: string
  width?: number
  /** controlling size of icons that are fonts */
  fontSize?: string
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

export const IconContainer = (props: IconContainerProps): JSX.Element => {
  const { text, icon, width, title, fontSize, ...rest } = props

  const currentIcon = icon ? (
    <StyledIconWrapper {...rest}>
      <SVGInline
        cleanup={['title']}
        svg={icon}
        accessibilityLabel={title}
        width={width + 'px'}
      />
    </StyledIconWrapper>
  ) : (
    <StyledIconWrapper {...rest} style={{ fontSize: fontSize }} />
  )

  return text ? (
    <span>
      {currentIcon}
      <StyledText>{text}</StyledText>
    </span>
  ) : (
    currentIcon
  )
}
