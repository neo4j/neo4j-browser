import React from 'react'

const title = 'Welcome to Neo4j'
const subtitle = 'This is Neo4j Browser'
const content = (
  <React.Fragment>
    <div className='lead text-center'>
      <img
        src='./assets/images/neo4j-world.png'
        className='img-responsive'
        alt='Neo4j Browser'
      />
      <p>BROWSER</p>
    </div>
  </React.Fragment>
)

export default { title, subtitle, content }
