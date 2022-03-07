export type BasicNode = {
  id: string
  labels: string[]
  properties: Record<string, string>
  propertyTypes: Record<string, string>
}
export type BasicRelationship = {
  id: string
  startNodeId: string
  endNodeId: string
  type: string
  properties: Record<string, string>
  propertyTypes: Record<string, string>
}
export type BasicNodesAndRels = {
  nodes: BasicNode[]
  relationships: BasicRelationship[]
}
