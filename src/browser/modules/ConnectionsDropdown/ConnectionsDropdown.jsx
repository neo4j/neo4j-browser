import { Component } from 'preact'
import { connect } from 'react-redux'
import { selectBookmark } from '../actions'
import { getBookmarks, getActiveBookmark } from '../reducer'

export class Dropdown extends Component {
  constructor (props) {
    super(props)
    this.state = {selected: this.props.activeBookmark}
  }
  change (event) {
    this.setState({selected: event.target.value}, () => {
      this.props.onBookmarkChange(this.state.selected)
    })
  }
  componentWillReceiveProps (newProps) {
    this.setState({selected: newProps.activeBookmark})
  }
  render () {
    let bms = this.props.bookmarks.map((bm) => {
      return <option value={bm.id} key={bm.id}>{bm.name}</option>
    })
    return (
      <select onChange={this.change.bind(this)} value={this.state.selected}>{bms}</select>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    bookmarks: getBookmarks(state),
    activeBookmark: getActiveBookmark(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onBookmarkChange: (id) => {
      dispatch(selectBookmark(id))
    }
  }
}

const ConnectedDropdown = connect(mapStateToProps, mapDispatchToProps)(Dropdown)
export default ConnectedDropdown
