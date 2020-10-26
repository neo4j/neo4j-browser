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
import { BorderedWrapper, TitleBar, ContentArea } from './styled'

class Accordion extends Component {
  state = {
    activeIndex: -1,
    initialLoad: true
  }

  titleClick = index => {
    const newIndex = this.state.activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex, initialLoad: false })
  }

  getChildProps = ({ index, defaultActive = false, forceActive = false }) => {
    const props = {
      titleProps: {
        onClick: () => this.titleClick(index)
      },
      contentProps: {}
    }
    if (forceActive) {
      props.titleProps.onClick = () => {}
    }
    if (defaultActive && this.state.initialLoad) {
      props.titleProps.onClick = () => this.titleClick(-1)
    }
    if (
      index === this.state.activeIndex ||
      (this.state.initialLoad && defaultActive) ||
      forceActive
    ) {
      props.titleProps.active = true
      props.contentProps.active = true
      return props
    }
    props.titleProps.active = false
    props.contentProps.active = false
    return props
  }

  render() {
    const { getChildProps } = this
    const { render: renderProp, ...rest } = this.props
    return (
      <BorderedWrapper {...rest}>
        {renderProp({ getChildProps })}
      </BorderedWrapper>
    )
  }
}

const Title = ({ children, ...rest }) => {
  return <TitleBar {...rest}>{children}</TitleBar>
}
Accordion.Title = Title

const Content = ({ children, active, ...rest }) => {
  if (!active) return null
  return <ContentArea {...rest}>{children}</ContentArea>
}
Accordion.Content = Content

export default Accordion
