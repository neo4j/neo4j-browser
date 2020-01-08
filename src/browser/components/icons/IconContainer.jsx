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

import React, { Component } from 'react'
import styled from 'styled-components'
import SVGInline from 'react-svg-inline'

const StyledIconWrapper = ({
  activeStyle,
  inactiveStyle,
  isOpen,
  children,
  ...rest
}) => {
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

export class IconContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mouseover: false
    }
  }

  render() {
    const { text, regulateSize, icon, width, title, ...rest } = this.props

    const regulateSizeStyle = regulateSize
      ? { fontSize: regulateSize + 'em' }
      : null

    const currentIcon = icon ? (
      <StyledIconWrapper {...rest}>
        <SVGInline svg={icon} accessibilityLabel={title} width={width + 'px'} />
      </StyledIconWrapper>
    ) : (
      <StyledIconWrapper {...rest} style={regulateSizeStyle} />
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
}
