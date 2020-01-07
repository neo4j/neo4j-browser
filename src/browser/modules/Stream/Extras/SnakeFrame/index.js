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
import Snake from './Snake'
import Score from './Score'
import FrameTemplate from '../../../Frame/FrameTemplate'
import { PaddedDiv } from '../../styled'
import { FormButton } from 'browser/components/buttons/index'
import { worldColor, foodColor } from './helpers'

const width = 600
const height = 300

const GameDiv = styled.div`
  margin: 30px auto;
  width: ${props => props.width}px;
  height: ${props => props.height + 50}px;
`

const SplashScreen = styled(GameDiv)`
  background-color: ${props => props.backgroundColor};
`

const SplashContents = styled.div`
  height: auto;
  padding: 100px auto;
  text-align: center;
  p {
    color: white;
    margin-top: 10px;
  }
  h2 {
    color: white;
    padding-top: 50px;
  }
  button {
    margin-top: 100px;
  }
`

export const InitialStartButton = styled(FormButton)`
  background-color: ${props => props.backgroundColor};
  color: #ffffff;
`

export class SnakeFrame extends React.Component {
  state = {
    score: 0,
    play: false,
    initialLoad: true
  }

  setScore = score => {
    this.setState({ score: score - 1 })
  }

  stop = () => {
    this.setState({ play: false })
  }

  play = () => {
    this.setState({ play: true, score: 0, initialLoad: false })
  }

  render() {
    const game = (
      <GameDiv
        width={width}
        height={height}
        style={{ display: this.state.initialLoad ? 'none' : 'block' }}
      >
        <Snake
          play={this.state.play}
          width={width}
          height={height}
          gridSize={20}
          onEat={this.setScore}
          onDie={this.stop}
        />
        <Score
          initialLoad={this.state.initialLoad}
          playing={this.state.play}
          score={this.state.score}
        />
        {!this.state.play && (
          <FormButton onClick={this.play}>Start game!</FormButton>
        )}
      </GameDiv>
    )
    const splash = this.state.initialLoad && (
      <SplashScreen width={width} height={height} backgroundColor={worldColor}>
        <SplashContents>
          <h2>Snake game!</h2>
          <InitialStartButton backgroundColor={foodColor} onClick={this.play}>
            Start the game!
          </InitialStartButton>
          <p>
            Use <strong>arrow keys</strong> or <strong>a-s-w-d</strong> to
            control the snake.
            <br />
            How much can you eat?
          </p>
        </SplashContents>
      </SplashScreen>
    )
    return (
      <PaddedDiv>
        {game}
        {splash}
      </PaddedDiv>
    )
  }
}

const Frame = props => {
  return (
    <FrameTemplate header={props.frame} contents={<SnakeFrame {...props} />} />
  )
}
export default Frame
