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

export function getGraphStats (graph) {
  let labelStats = {}
  let relTypeStats = {}
  graph.nodes().forEach((node) => {
    node.labels.forEach((label) => {
      if (labelStats[label]) {
        labelStats[label].count = labelStats[label].count + 1
        labelStats[label].properties = Object.assign({}, labelStats[label].properties, node.propertyMap)
      } else {
        labelStats[label] = {
          count: 1,
          properties: node.propertyMap
        }
      }
    })
  })
  graph.relationships().forEach((rel) => {
    if (relTypeStats[rel.type]) {
      relTypeStats[rel.type].count = relTypeStats[rel.type].count + 1
      relTypeStats[rel.type].properties = Object.assign({}, relTypeStats[rel.type].properties, rel.propertyMap)
    } else {
      relTypeStats[rel.type] = {
        count: 1,
        properties: rel.propertyMap
      }
    }
  })
  return {labels: labelStats, relTypes: relTypeStats}
}
