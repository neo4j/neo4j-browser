export const UP = 'up'
export const DOWN = 'down'
export const LEFT = 'left'
export const RIGHT = 'right'

export const maxSpeed = 4 // Smaller is faster

export const foodColor = '#77AF53'
export const snakeColor = '#FFFFFF'
export const worldColor = '#3C8ABC'

export const transitionDirection = (current, next) => {
  if (current === UP && next !== DOWN) {
    return next
  }
  if (current === DOWN && next !== UP) {
    return next
  }
  if (current === LEFT && next !== RIGHT) {
    return next
  }
  if (current === RIGHT && next !== LEFT) {
    return next
  }
  return current
}

export const getInitialState = (
  play = false,
  width = 600,
  height = 400,
  gridSize = 20
) => {
  const state = {
    play,
    world: {
      color: worldColor,
      width,
      height
    },
    snake: {
      body: [
        {
          x: 150 - (150 % gridSize),
          y: 150 - (150 % gridSize)
        }
      ],
      width: gridSize,
      height: gridSize,
      direction: RIGHT
    },
    frame: 0,
    speed: 10,
    step: gridSize
  }
  newFood(state)
  return state
}

export const newFood = state => {
  const size = state.snake.width
  const foodX = Math.max(Math.random() * state.world.width - size, 0)
  const foodY = Math.max(Math.random() * state.world.height - size, 0)
  state.food = {
    x: foodX - (foodX % size),
    y: foodY - (foodY % size)
  }
}

export const doesCollide = ({ x, y }, state) => {
  const { body } = state.snake
  if (x < 0 || x > state.world.width - state.snake.width) {
    return true
  }
  if (y < 0 || y > state.world.height - state.snake.height) {
    return true
  }
  for (let i = 0; i < body.length; i++) {
    const { x: bx, y: by } = body[i]
    if (x === bx && y === by) {
      return true
    }
  }
  return false
}

export const rect = props => {
  const { ctx, x, y, width, height } = props
  ctx.fillRect(x, y, width, height)
}
