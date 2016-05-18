import React from 'react'

const DatabaseInfo = ({ labels = [], relationshipTypes = [], properties = [], onItemClick }) => {
  const createItems = (originalList, className, editorCommandTemplate, showStar = true) => {
    let items = [...originalList]
    if (showStar) {
      items.unshift('*')
    }
    return items.map((text, index) => {
      const getNodesCypher = editorCommandTemplate(text)
      return <button onClick={() => onItemClick(getNodesCypher)} className={className} key={index}>{text}</button>
    })
  }
  const labelItems = () => {
    if (labels.length > 0) {
      const editorCommandTemplate = (text) => {
        if (text === '*') {
          return 'MATCH (n) RETURN n LIMIT 25'
        }
        return `MATCH (n:${text}) RETURN n LIMIT 25`
      }
      return createItems(labels, 'token-label', editorCommandTemplate)
    }
    return <p>There are no labels in database</p>
  }
  const relationshipItems = () => {
    if (relationshipTypes.length > 0) {
      const editorCommandTemplate = (text) => {
        if (text === '*') {
          return 'MATCH ()-[r]->() RETURN r LIMIT 25'
        }
        return `MATCH p=()-[r:${text}]->() RETURN p LIMIT 25`
      }
      return createItems(relationshipTypes, 'token-relationship', editorCommandTemplate)
    }
    return <p>No relationships in database</p>
  }
  const propertyItems = () => {
    if (properties.length > 0) {
      const editorCommandTemplate = (text) => {
        return `MATCH (n) WHERE EXISTS(n.${text}) RETURN DISTINCT "node" as element, n.${text} AS ${text} LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.${text}) RETURN DISTINCT "relationship" AS element, r.${text} AS ${text} LIMIT 25`
      }
      return createItems(properties, 'token-property', editorCommandTemplate, false)
    }
    return <p>There are no properites in database</p>
  }
  return (
    <div id='db-drawer'>
      <h4> Database Information</h4>
      <h5> Node Labels </h5>
      {labelItems()}
      <h5> Relationship Types </h5>
      {relationshipItems()}
      <h5> Property Keys </h5>
      {propertyItems()}
    </div>
  )
}
export default DatabaseInfo
