import React from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid'
import ReactSwipe from 'react-swipe'
import Slide from './Slide'
import Directives from './Directives'
import Button from 'grommet/components/Button'

import styles from './style.css'

export class Carousel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {slides: null, firstRender: false}
  }
  shouldComponentUpdate () {
    if (this.state.firstRender) {
      return false
    } else {
      this.setState({firstRender: true})
      return true
    }
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
    this.setState({ slides: reactSlides })
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
        const slideComponent = <Slide key={uuid.v4()} html={slide.html.innerHTML}/>
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
          <Button fill className={styles.leftButton} label='<' primary onClick={this.prev.bind(this)}/>
          <ReactSwipe className={styles.carousel} ref='reactSwipe' swipeOptions={{continuous: false}}>
            {ListOfSlides}
          </ReactSwipe>
          <Button className={styles.rightButton} label='>' primary onClick={this.next.bind(this)}/>
        </div>
      )
    }
    if (this.props.withDirectives) {
      return (
        <Directives content={<Slide html={this.props.html}/>} />
      )
    } else {
      return (
        <Slide html={this.props.html}/>
      )
    }
  }
}
