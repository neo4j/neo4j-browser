import React from 'react'
import ReactDOM from 'react-dom'
import uuid from 'uuid'
import {Tabs, Tab} from 'material-ui/Tabs'
// import Slider from 'material-ui/Slider'

export class Slide extends React.Component {
  constructor (props) {
    super(props)
    this.slides = null
    this.state = {loaded: false, element: null}
  }
  componentDidMount () {
    const slides = ReactDOM.findDOMNode(this).getElementsByTagName('slide')
    let reactSlides = null
    if (slides.length > 0) {
      reactSlides = Array.from(slides).map((slide) => {
        const label = ReactDOM.findDOMNode(slide).getElementsByTagName('h3')[0]
        return {
          html: s,
          label: label
        }
      })
    }

    this.setState(Object.assign(this.state, { element: reactSlides, loaded: true }))
  }
  render () {
    if (this.state.loaded) {
      if (this.state.element) {
        const ListOfSlides = this.state.element.map((slide) => {

          return (
            <Tab label={slide.label.textContent} key={uuid.v4()}>
              <div dangerouslySetInnerHTML={{__html: slide.html.innerHTML}} />
            </Tab>
          )
        })
        return (
          <Tabs children={ListOfSlides}>
          </Tabs>
        )
      } else {
        return (
          <div dangerouslySetInnerHTML={{__html: this.props.html}} />
        )
      }
    }
    return (
        <div dangerouslySetInnerHTML={{__html: this.props.html}} ref={(ref) => {

      }} />
    )
  }
}
