export function recordsToTableArray (records, intChecker, intConverter) {
  const recordValues = records.map((record) => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val, intChecker, intConverter)))
    return out
  })
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
  let relationships = []
  let nodes = []
  let keys = records[0].keys
  records.forEach((record) => {
    let graphItems = keys.map((key) => record.get(key))
    graphItems.forEach((item) => extractNodesAndRelationships(item, nodes, relationships, types))
  })
  return { nodes: nodes, relationships: relationships }
}

const extractNodesAndRelationships = (item, nodes, relationships, types) => {
  if (item instanceof types.Node) {
    nodes.push({id: item.identity, labels: item.labels, properties: item.properties})
  }
  if (item instanceof types.Relationship) {
    relationships.push({id: item.identity, startNodeId: item.start, endNodeId: item.end, type: item.type, properties: item.properties})
  }
  if (item instanceof types.Path) {
    let paths = Array.isArray(item) ? item : [item]
    paths.forEach((path) => {
      path.segments.forEach((segment) => {
        extractNodesAndRelationships(segment.start, nodes, relationships, types)
        extractNodesAndRelationships(segment.end, nodes, relationships, types)
        extractNodesAndRelationships(segment.relationship, nodes, relationships, types)
      })
    })
  }
}
