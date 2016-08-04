export function toObjects (records, intChecker, intConverter) {
  const recordValues = records.map((record) => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val, intChecker, intConverter)))
    return out
  })
  return recordValues
}

export function recordsToTableArray (records, intChecker, intConverter) {
  const recordValues = toObjects(records, intChecker, intConverter)
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString (item, intChecker, intConverter) {
  if (intChecker(item)) return intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, intChecker, intConverter)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, intChecker, intConverter)
}

export function arrayIntToString (arr, intChecker, intConverter) {
  return arr.map((item) => itemIntToString(item, intChecker, intConverter))
}

export function objIntToString (obj, intChecker, intConverter) {
  Object.keys(obj).forEach((key) => {
    obj[key] = itemIntToString(obj[key], intChecker, intConverter)
  })
  return obj
}

export function extractNodesAndRelationshipsFromRecords (records, types) {
  let keys = records[0].keys
  let rawNodes = []
  let rawRels = []
  records.forEach((record) => {
    let graphItems = keys.map((key) => record.get(key))
    rawNodes = [...rawNodes, ...graphItems.filter((item) => item instanceof types.Node)]
    rawRels = [...rawRels, ...graphItems.filter((item) => item instanceof types.Relationship)]
    let paths = graphItems.filter((item) => item instanceof types.Path)
    paths.forEach((item) => extractNodesAndRelationshipsFromPath(item, rawNodes, rawRels, types))
  })
  const nodes = rawNodes.map((item) => {
    return {id: item.identity.toString(), labels: item.labels, properties: item.properties}
  })
  const relationships = rawRels.filter((item) => nodes.filter((node) => node.id === item.start.toString()).length > 0 && nodes.filter((node) => node.id === item.end.toString()).length > 0)
  .map((item) => {
    return {id: item.identity.toString(), startNodeId: item.start, endNodeId: item.end, type: item.type, properties: item.properties}
  })
  return { nodes: nodes, relationships: relationships }
}

const extractNodesAndRelationshipsFromPath = (item, rawNodes, rawRels) => {
  let paths = Array.isArray(item) ? item : [item]
  paths.forEach((path) => {
    path.segments.forEach((segment) => {
      rawNodes.push(segment.start)
      rawNodes.push(segment.end)
      rawRels.push(segment.relationship)
    })
  })
}
