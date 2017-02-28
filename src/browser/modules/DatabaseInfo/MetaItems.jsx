import React from 'react'
import classNames from 'classnames'
import styles from './style_meta.css'

const createItems = (originalList, onItemClick, className, editorCommandTemplate, showStar = true) => {
  let items = [...originalList]
  if (showStar) {
    items.unshift('*')
  }
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text)
    return (
      <button
        key={index}
        onClick={() => onItemClick(getNodesCypher)}
        className={classNames({
          [styles.chip]: true,
          [className]: true
        })}>
        {text}
      </button>
    )
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
      <h4> Node Labels </h4>
      <div className={classNames({
        [styles['wrapper']]: true,
        [styles['label-wrapper']]: true
      })}>
        {labelItems}
      </div>
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
      <h4>Relationship Types </h4>
      <div className={classNames({
        [styles['wrapper']]: true,
        [styles['relationship-wrapper']]: true
      })}>
        {relationshipItems}
      </div>
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
      <h4> Property Keys </h4>
      <div className={classNames({
        [styles['wrapper']]: true,
        [styles['property-key-wrapper']]: true
      })}>
        {propertyItems}
      </div>
    </div>
  )
}

export {
  LabelItems,
  RelationshipItems,
  PropertyItems
}
