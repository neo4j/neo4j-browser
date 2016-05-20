import React from 'react'

const createItems = (originalList, onItemClick, className, editorCommandTemplate, showStar = true) => {
  let items = [...originalList]
  if (showStar) {
    items.unshift('*')
  }
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text)
    return <button onClick={() => onItemClick(getNodesCypher)} className={className} key={index}>{text}</button>
  })
}
const LabelItems = ({labels, onItemClick}) => {
  let labelItems = <p>There are no labels in database</p>
  if (labels.length > 0) {
    const editorCommandTemplate = (text) => {
      if (text === '*') {
        return 'MATCH (n) RETURN n LIMIT 25'
      }
      return `MATCH (n:${text}) RETURN n LIMIT 25`
    }
    labelItems = createItems(labels, onItemClick, 'token-label', editorCommandTemplate)
  }
  return (
    <div>
      <h5> Node Labels </h5>
      {labelItems}
    </div>
  )
}
const RelationshipItems = ({relationshipTypes, onItemClick}) => {
  let relationshipItems = <p>No relationships in database</p>
  if (relationshipTypes.length > 0) {
    const editorCommandTemplate = (text) => {
      if (text === '*') {
        return 'MATCH ()-[r]->() RETURN r LIMIT 25'
      }
      return `MATCH p=()-[r:${text}]->() RETURN p LIMIT 25`
    }
    relationshipItems = createItems(relationshipTypes, onItemClick, 'token-relationship', editorCommandTemplate)
  }
  return (
    <div>
      <h5>Relationship Types </h5>
      {relationshipItems}
    </div>
  )
}
const PropertyItems = ({properties, onItemClick}) => {
  let propertyItems = <p>There are no properites in database</p>
  if (properties.length > 0) {
    const editorCommandTemplate = (text) => {
      return `MATCH (n) WHERE EXISTS(n.${text}) RETURN DISTINCT "node" as element, n.${text} AS ${text} LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.${text}) RETURN DISTINCT "relationship" AS element, r.${text} AS ${text} LIMIT 25`
    }
    propertyItems = createItems(properties, onItemClick, 'token-property', editorCommandTemplate, false)
  }
  return (
    <div>
      <h5> Property Keys </h5>
      {propertyItems}
    </div>
  )
}

export {
  LabelItems,
  RelationshipItems,
  PropertyItems
}
