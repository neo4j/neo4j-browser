import React from 'react'
import Slide from 'browser/modules/Carousel/Slide'

const title = 'all guides'
const slides = [
  <Slide key="first">
    <h3>Guides in Neo4j Browser</h3>
    <ul className="undecorated">
      <li>
        a guide about getting started
        <a exec-topic="guide intro">:guide intro</a>
      </li>
      <li>
        a guide about movies
        <a exec-topic="guide movies">:guide movies</a>
      </li>

      <li>
        you can also enter a custom URL on a whitelisted domain
        <a exec-topic="guide https://guides.neo4j.com/sandbox/movies/index.html">
          :guide https://guides.neo4j.com/sandbox/movies/index.html
        </a>
        tip: unsure what domains are whitelisted? run{' '}
        <a exec-topic="CALL dbms.clientConfig">CALL dbms.clientConfig</a>
      </li>
    </ul>
  </Slide>
]

export default { title, slides }
