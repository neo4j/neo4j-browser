const Visible = ({if: cond, children}) => {
  return cond ? children : null
}
export default Visible
