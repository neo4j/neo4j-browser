const Visible = ({if: cond, children}) => {
  return cond ? children[0] : null
}
export default Visible
