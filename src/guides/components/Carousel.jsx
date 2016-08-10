import React from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid'
import ReactSwipe from 'react-swipe'
import FlatButton from 'material-ui/FlatButton'

export class Carousel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loaded: false, slides: null}
  }
  componentDidMount () {
    const slides = ReactDOM.findDOMNode(this).getElementsByTagName('slide')
    let reactSlides = null
    if (slides.length > 0) {
      reactSlides = Array.from(slides).map((slide) => {
        const label = ReactDOM.findDOMNode(slide).getElementsByTagName('h3')[0]
        return {
          html: slide,
          label: label
        }
      })
    }

    this.setState(Object.assign(this.state, { slides: reactSlides, loaded: true }))
  }
  next () {
    this.refs.reactSwipe.next()
  }
  prev () {
    this.refs.reactSwipe.prev()
  }
  render () {
    if (this.state.loaded) {
      if (this.state.slides) {
        const ListOfSlides = this.state.slides.map((slide) => {
          return (
            <div className='slide' key={uuid.v4()}>
              <div dangerouslySetInnerHTML={{__html: slide.html.innerHTML}} />
            </div>
          )
        })
        return (
          <div className='carousel'>
            <FlatButton className='left-button' label='<' primary onClick={this.prev.bind(this)}/>
            <ReactSwipe ref='reactSwipe' swipeOptions={{continuous: false}}>
              {ListOfSlides}
            </ReactSwipe>
            <FlatButton className='right-button' label='>' primary onClick={this.next.bind(this)}/>
          </div>
        )
      }
    }
    return (
      <div dangerouslySetInnerHTML={{__html: this.props.html}} />
    )
  }
}
