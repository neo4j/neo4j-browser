export type GraphEntityProperty = { key: string; value: string; type: string }

class GraphEntityModel {
  id: string
  propertyList: GraphEntityProperty[]
  propertyMap: Record<string, string>
  isNode: boolean
  isRelationship: boolean

  selected: boolean

  constructor(
    id: string,
    properties: Record<string, string>,
    propertyTypes: Record<string, string>,
    isNode: boolean
  ) {
    this.id = id
    this.propertyList = Object.keys(properties).map((key: string) => ({
      key,
      type: propertyTypes[key],
      value: String(properties[key])
    }))
    this.isNode = isNode
    this.isRelationship = !this.isNode
    this.propertyMap = Object.assign(
      {},
      ...this.propertyList.map(property => ({ [property.key]: property.value }))
    )

    this.selected = false
  }
}

export default GraphEntityModel
