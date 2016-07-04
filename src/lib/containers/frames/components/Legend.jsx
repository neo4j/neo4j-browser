import React from 'react'
import styles from './style.css'

export const LegendComponent = ({stats, graphStyle}) => {
  const mapLabels = (labels) => {
    const labelList = Object.keys(labels).map((legendItemKey) => {
      const styleForItem = graphStyle.forNode({labels: [legendItemKey]})
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <li>
          <div style={style} className={`${styles.token} ${styles['token-label']}`}>
            {legendItemKey}
            <span className={styles.count}>{`(${labels[legendItemKey]})`}</span>
          </div>
        </li>
      )
    })
    return (
      <ul className={styles['list-inline']}>
        {labelList}
      </ul>
    )
  }
  const mapRelTypes = (legendItems) => {
    const relTypeList = Object.keys(legendItems).map((legendItemKey) => {
      const styleForItem = graphStyle.forRelationship({type: [legendItemKey]})
      const style = {'backgroundColor': styleForItem.get('color'), 'color': styleForItem.get('text-color-internal')}
      return (
        <li>
          <div className={styles.contents}>
            <div style={style} className={`${styles.token} ${styles['token-relationship-type']}`}>
              {legendItemKey}
              <span className={styles.count}>{`(${legendItems[legendItemKey]})`}</span>
            </div>
          </div>
        </li>
      )
    })
    return (
      <ul className={styles['list-inline']}>
        {relTypeList}
      </ul>
    )
  }
  return (
    <div className={styles.legend}>
      {mapLabels(stats.labels)}
      {mapRelTypes(stats.relTypes)}
    </div>

  )
}
