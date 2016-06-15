import React from 'react'
import styles from './style.css'
import classNames from 'classnames'

/**
 * Button to be used for simple action tasks
*/

const ActionButton = (props) => {
  const mergedProps = Object.assign({kind: 'primary'}, props)
  let classObj = {
    [styles.actionButton]: true,
    [styles[mergedProps.kind]]: true,
    [styles.disabled]: mergedProps.disabled,
    [styles['no-fill']]: mergedProps.noFill
  }
  if (mergedProps['classNames'] !== undefined) {
    mergedProps.classNames.forEach((cn) => { classObj[cn] = true })
  }

  return (
    <button
      className={classNames(classObj)}
      onClick={mergedProps.onClick}
      disabled={mergedProps.disabled ? 'disabled' : ''}
      title={mergedProps.tooltip}
    >
      {props.label}
    </button>
  )
}

ActionButton.propTypes = {
  onClick: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  kind: React.PropTypes.string, // primary, secondary, danger
  tooltip: React.PropTypes.string,
  disabled: React.PropTypes.bool,
  classNames: React.PropTypes.array,
  noFill: React.PropTypes.bool
}

export default ActionButton
