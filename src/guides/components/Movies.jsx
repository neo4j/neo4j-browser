import React from 'React'
import Intro from 'html!./../html/test.html'
import { Slide } from './Slide'

export const Movies = () => {
  return (
    <div>
      <Slide html={Intro}/>
      <Slide html={'<h2>2</h2>'}/>
      <Slide html={'<h2>3</h2>'}/>
      <Slide html={'<h2>4</h2>'}/>
    </div>
    )
}
