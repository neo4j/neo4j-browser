/* global neo4j */
export function mapBoltRecordsToGraph (boltResponse) {
  let graph = new neo.models.Graph()
  let keys = boltResponse[0].keys
  let nodes = []
  let unmappedRelationships = []
  let relationships = []
  boltResponse.forEach((record) => {
    let graphItems = keys.map((key) => record.get(key))
    graphItems.forEach((item) => extractNodesAndRelationships(item, nodes, unmappedRelationships))
    graph.addNodes(nodes)

    unmappedRelationships.forEach((rel) => {
      let source = graph.findNode(rel.start)
      let target = graph.findNode(rel.end)
      relationships.push(new neo.models.Relationship(rel.identity, source, target, rel.type, rel.properties))
    })
  })
  graph.addRelationships(relationships)
  graph.display = { initialNodeDisplay: 300, nodeCount: 1 }
  return graph
}

let extractNodesAndRelationships = (item, nodes, unmappedRelationships) => {
  if (item instanceof neo4j.v1.types.Node) {
    nodes.push(new neo.models.Node(item.identity, item.labels, item.properties))
  }
  if (item instanceof neo4j.v1.types.Relationship) {
    unmappedRelationships.push(item)
  }
  if (item instanceof neo4j.v1.types.Path) {
    let paths = Array.isArray(item) ? item : [item]
    paths.forEach((path) => {
      path.segments.forEach((segment) => {
        extractNodesAndRelationships(segment.start, nodes, unmappedRelationships)
        extractNodesAndRelationships(segment.end, nodes, unmappedRelationships)
        extractNodesAndRelationships(segment.relationship, nodes, unmappedRelationships)
      })
    })
  }
}
