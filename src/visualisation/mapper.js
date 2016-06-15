export function createGraph (nodes, relationships) {
  let graph = new neo.models.Graph()
  graph.addNodes(mapNodes(nodes))
  graph.addRelationships(mapRelationships(relationships, graph))
  graph.display = { initialNodeDisplay: 300, nodeCount: 1 }
  return graph
}

export function mapNodes (nodes) {
  return nodes.map((node) => new neo.models.Node(node.id, node.labels, node.properties))
}

export function mapRelationships (relationships, graph) {
  return relationships.map((rel) => {
    const source = graph.findNode(rel.startNodeId)
    const target = graph.findNode(rel.endNodeId)
    return new neo.models.Relationship(rel.id, source, target, rel.type, rel.properties)
  })
}
