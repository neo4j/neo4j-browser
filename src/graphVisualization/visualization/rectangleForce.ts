const aspectRatio = 3
const gravityStrength = 0.1

const sq = (d: number) => d * d
const integral = (a: number, b: number) =>
  (b * Math.log(sq(a) + sq(b))) / 2 + a * Math.atan(b / a)

export const rectangleForce = () => {
  let nodes: any

  const force = (alpha: number) => {
    const targetRatio =
      aspectRatio < 0 ? 1 / (1 - aspectRatio) : aspectRatio + 1
    const strength = gravityStrength * alpha

    for (const node of nodes) {
      const actualRatio = Math.abs(node.x / node.y)
      const width = actualRatio > targetRatio ? node.x : node.y * targetRatio
      const height = actualRatio < targetRatio ? node.y : node.x / targetRatio
      const maxX = width - node.x
      const minX = -width - node.x
      const maxY = height - node.y
      const minY = -height - node.y

      const vx =
        integral(maxX, maxY) -
        integral(maxX, minY) -
        integral(minX, maxY) +
        integral(minX, minY)
      const vy =
        integral(maxY, maxX) -
        integral(minY, maxX) -
        integral(maxY, minX) +
        integral(minY, minX)
      node.x += vx * strength
      node.y += vy * strength
    }
  }

  force.initialize = (_: any) => {
    nodes = _
  }

  return force
}
