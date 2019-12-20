import neo4j from 'neo4j-driver'

export const csvFormat = anything => {
  if (typeof anything === 'number') {
    return numberFormat(anything)
  }
  if (neo4j.isInt(anything)) {
    return anything.toString()
  }
  if (anything instanceof neo4j.types.Point) {
    return spacialFormat(anything)
  }
  if (isTemporalType(anything)) {
    return `"${anything.toString()}"`
  }
  if (typeof anything === 'string') {
    return anything
  }
  return undefined
}

export const stringModifier = anything => {
  if (typeof anything === 'number') {
    return numberFormat(anything)
  }
  if (neo4j.isInt(anything)) {
    return anything.toString()
  }
  if (anything instanceof neo4j.types.Point) {
    return spacialFormat(anything)
  }
  if (isTemporalType(anything)) {
    return `"${anything.toString()}"`
  }
  return undefined
}

const numberFormat = anything => {
  // Exclude false positives and return early
  if ([Infinity, -Infinity, NaN].includes(anything)) {
    return `${anything}`
  }
  if (Math.floor(anything) === anything) {
    return `${anything}.0`
  }
  return undefined
}
const spacialFormat = anything => {
  const zString = anything.z ? `, z:${anything.z}` : ''
  return `point({srid:${anything.srid}, x:${anything.x}, y:${anything.y}${zString}})`
}

const isTemporalType = anything =>
  anything instanceof neo4j.types.Date ||
  anything instanceof neo4j.types.DateTime ||
  anything instanceof neo4j.types.Duration ||
  anything instanceof neo4j.types.LocalDateTime ||
  anything instanceof neo4j.types.LocalTime ||
  anything instanceof neo4j.types.Time
