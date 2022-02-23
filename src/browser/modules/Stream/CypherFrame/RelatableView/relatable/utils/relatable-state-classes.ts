import { entries, kebabCase, keys, map, reduce } from 'lodash-es'

import { ROW_STATE_CLASSES, TOOLBAR_STATE_CLASSES } from '../constants'

export function getRowClasses(row: any) {
  return `relatable__table-row relatable__table-body-row ${getRowStateClasses(
    row
  )}`
}

export function createRowStateClasses() {
  return map(entries(ROW_STATE_CLASSES), ([state, bgColor]) =>
    bgColor
      ? `.${getRowStateClass(state)} {
        background-color: ${bgColor};
      }`
      : ''
  )
}

export function createToolbarStateClasses() {
  return map(
    entries(TOOLBAR_STATE_CLASSES),
    ([state, bgColor]) => `
    /* need to win over semantic specificity */
    .menu .label.${getToolbarStateClass(state)} {
      background-color: ${bgColor};
    }
  `
  )
}

export function getToolbarStateClass(state: string) {
  return `relatable__toolbar-label--${kebabCase(state)}`
}

function getRowStateClasses(row: any) {
  return reduce(
    keys(ROW_STATE_CLASSES),
    (agg, state) => (row[state] ? `${agg} ${getRowStateClass(state)}` : agg),
    ''
  )
}

function getRowStateClass(state: string) {
  return `relatable__table-row-state--${kebabCase(state)}`
}
