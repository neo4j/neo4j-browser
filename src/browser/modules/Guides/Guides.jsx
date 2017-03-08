import { Component } from 'preact'
import ReactDOM from 'react-dom'
import uuid from 'uuid'
import ReactSwipe from 'react-swipe'
import Slide from './Slide'
import Directives from 'browser-components/Directives'

import styles from './style.css'

export default class Guides extends Component {
  constructor (props) {
    super(props)
    this.state = {slides: null, firstRender: true}
  }
  shouldComponentUpdate () {
    return this.state.firstRender
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
    this.setState({ slides: reactSlides, firstRender: false })
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
        const slideComponent = <Slide key={uuid.v4()} html={slide.html.innerHTML} />
        if (this.props.withDirectives) {
          return (
            <div key={uuid.v4()}>
              <Directives content={slideComponent} />
            </div>
          )
        } else {
          return (
            <div key={uuid.v4()}>
              {slideComponent}
            </div>
          )
        }
      })
      return (
        <div key={uuid.v4()} className={styles.carouselContainer}>
          <button className={styles.leftButton} onClick={this.prev.bind(this)}>{'<'}</button>
          <ReactSwipe className={styles.carousel} ref='reactSwipe' swipeOptions={{continuous: false}}>
            {ListOfSlides}
          </ReactSwipe>
          <button className={styles.rightButton} onClick={this.next.bind(this)}>{'>'}</button>
        </div>
      )
    }
    if (this.props.withDirectives) {
      return (
        <Directives content={<Slide html={this.props.html} />} />
      )
    } else {
      return (
        <Slide html={this.props.html} />
      )
    }
  }
}
