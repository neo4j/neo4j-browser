import { v1 as neo4j } from 'neo4j-driver-alias'

export const stringFormat = anything => {
  if (typeof anything === 'number') {
    if (Math.floor(anything) === anything) {
      return `${anything}.0`
    }
    return undefined
  }
  if (neo4j.isInt(anything)) {
    return anything.toString()
  }
  if (anything instanceof neo4j.types.Point) {
    const zString = anything.z ? `, z:${anything.z}` : ''
    return `point({srid:${anything.srid}, x:${anything.x}, y:${anything.y}${zString}})`
  }
  if (
    anything instanceof neo4j.types.Date ||
    anything instanceof neo4j.types.DateTime ||
    anything instanceof neo4j.types.Duration ||
    anything instanceof neo4j.types.LocalDateTime ||
    anything instanceof neo4j.types.LocalTime ||
    anything instanceof neo4j.types.Time
  ) {
    return `"${anything.toString()}"`
  }
  return undefined
}
