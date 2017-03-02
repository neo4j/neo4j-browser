import React from 'react'

const Visible = ({if: cond, children}) => {
  return cond ? React.Children.only(children) : null
}
export default Visible
