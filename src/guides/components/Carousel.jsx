import React from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid'
import ReactSwipe from 'react-swipe'
import Slide from './Slide'
import FlatButton from 'material-ui/FlatButton'

export class Carousel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {slides: null}
  }
  componentDidMount () {
    const slides = ReactDOM.findDOMNode(this).getElementsByTagName('slide')
    let reactSlides = this
    if (slides.length > 0) {
      reactSlides = Array.from(slides).map((slide) => {
        return {
          html: slide
        }
      })
    }
    this.setState(Object.assign(this.state, { slides: reactSlides }))
  }
  next () {
    this.refs.reactSwipe.next()
  }
  prev () {
    this.refs.reactSwipe.prev()
  }
  render () {
    if (this.state.slides && Array.isArray(this.state.slides)) {
      const ListOfSlides = this.state.slides.map((slide) => {
        return (
          <div key={uuid.v4()}>
            <Slide key={uuid.v4()} html={slide.html.innerHTML}/>
          </div>
        )
      })
      return (
        <div key={uuid.v4()}className='carousel-container'>
          <FlatButton className='left-button' label='<' primary onClick={this.prev.bind(this)}/>
          <ReactSwipe className='carousel' ref='reactSwipe' swipeOptions={{continuous: false}}>
            {ListOfSlides}
          </ReactSwipe>
          <FlatButton className='right-button' label='>' primary onClick={this.next.bind(this)}/>
        </div>
      )
    }
    return (
      <Slide html={this.props.html}/>
    )
  }
}
