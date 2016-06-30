import React from 'react'
import styles from './style.css'

export const InspectorComponent = ({hoveredItem, graphStyle}) => {
  let inspectorContent

  const mapItemProperties = (itemProperties) => {
    return itemProperties.map((prop) => {
      return (
        <li className={styles.pair}>
          <div className={styles.key}>{prop.key + ': '}</div>
          <div className={styles.value}>{prop.value.toString()}</div>
        </li>
      )
    })
  }
  if (hoveredItem) {
    const item = hoveredItem.item
    if (hoveredItem.type === 'context-menu-item') {
      inspectorContent = (
        <ul className={styles['list-inline']}>
          <li className={styles.token + ' ' + styles['token-context-menu-key'] + ' ' + styles['token-label']}>{item.label}</li>
          <li className={styles.pair}>
            <div className={styles.value}>{item.content}</div>
          </li>
        </ul>
      )
    } else if (hoveredItem.type === 'canvas') {
      const description = `Displaying ${item.nodeCount} nodes, ${item.relationshipCount} relationships.`
      inspectorContent = (
        <ul className={styles['list-inline']}>
          <li className={styles.pair}>
            <div className={styles.value}>{description}</div>
          </li>
        </ul>
      )
    } else if (hoveredItem.type === 'node') {
      const style = {'background-color': graphStyle.forNode(item).get('color'), 'color': graphStyle.forNode(item).get('text-color-internal')}
      inspectorContent = (
        <ul className={styles['list-inline']}>
          <li style={style} className={styles.token + ' ' + styles['token-label']}>{item.labels[0]}</li>
          <li className={styles.pair}>
            <div className={styles.key}>{'<id>:'}</div>
            <div className={styles.value}>{item.id}</div>
          </li>
          {mapItemProperties(item.properties)}
        </ul>
      )
    } else if (hoveredItem.type === 'relationship') {
      const style = {'background-color': graphStyle.forRelationship(item).get('color'), 'color': graphStyle.forRelationship(item).get('text-color-internal')}
      inspectorContent = (
        <ul className={styles['list-inline']}>
          <li style={style} className={styles.token + ' ' + styles['token-relationship-type']}>{item.type}</li>
          <li className={styles.pair}>
            <div className={styles.key}>{'<id>:'}</div>
            <div className={styles.value}>{item.id}</div>
          </li>
          {mapItemProperties(item.properties)}
        </ul>
      )
    }
  }
  return (
    <div className={styles['status-bar']}>
      <div className={styles['status']}>
        <div className={styles['inspector-footer']}>
          <div className={styles['inspector-footer-row']}>
            {inspectorContent}
          </div>
        </div>
      </div>
    </div>

  )
}
