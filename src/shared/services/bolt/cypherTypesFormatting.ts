import { Duration } from 'luxon'
import neo4j from 'neo4j-driver'

export const csvFormat = (anything: any) => {
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

export const stringModifier = (anything: any) => {
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
    if (isDuration(anything)) {
      return durationFormat(anything)
    } else {
      return `"${anything.toString()}"`
    }
  }
  return undefined
}

export const durationFormat = (duration: typeof neo4j.types.Duration): string =>
  Duration.fromISO(duration.toString())
    .shiftTo('years', 'days', 'months', 'hours', 'minutes', 'seconds')
    .normalize()
    .toISO()

const numberFormat = (anything: any) => {
  // Exclude false positives and return early
  if ([Infinity, -Infinity, NaN].includes(anything)) {
    return `${anything}`
  }
  if (Math.floor(anything) === anything) {
    return `${anything}.0`
  }
  return undefined
}
const spacialFormat = (anything: any): string => {
  const zString = anything.z !== undefined ? `, z:${anything.z}` : ''
  return `point({srid:${anything.srid}, x:${anything.x}, y:${anything.y}${zString}})`
}

const isTemporalType = (anything: any) =>
  anything instanceof neo4j.types.Date ||
  anything instanceof neo4j.types.DateTime ||
  anything instanceof neo4j.types.Duration ||
  anything instanceof neo4j.types.LocalDateTime ||
  anything instanceof neo4j.types.LocalTime ||
  anything instanceof neo4j.types.Time

const isDuration = (anything: any) => anything instanceof neo4j.types.Duration
