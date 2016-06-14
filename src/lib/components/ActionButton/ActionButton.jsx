import React from 'react'
import styles from './style.css'
import classNames from 'classnames'

const ActionButton = (props) => {
  const mergedProps = Object.assign({kind: 'primary'}, props)
  const classes = classNames({
    [styles.actionButton]: true,
    [styles[mergedProps.kind]]: true,
    [styles.disabled]: mergedProps.disabled,
    [styles['no-fill']]: mergedProps.noFill
  })
  return (
    <button
      className={classes}
      onClick={mergedProps.onClick}
      disabled={mergedProps.disabled ? 'disabled': ''}
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
  className: React.PropTypes.object,
  noFill: React.PropTypes.bool
}

export default ActionButton
