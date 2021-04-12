import React from 'react'
import Slide from 'browser/modules/GuideCarousel/GuideSlide'

const title = 'all guides'
const slides = [
  <Slide key="first">
    <h3>Guides in Neo4j Browser</h3>
    <ul className="undecorated">
      <li>
        a guide about getting started
        <a exec-command=":guide intro">:guide intro</a>
      </li>
      <li>
        a guide about movies
        <a exec-command=":guide movies">:guide movies</a>
      </li>

      <li>
        <a exec-command=":guide https://guides.neo4j.com/sandbox/movies/index.html">
          :guide https://guides.neo4j.com/sandbox/movies/index.html
        </a>
      </li>
    </ul>
  </Slide>
]

export default { title, slides }