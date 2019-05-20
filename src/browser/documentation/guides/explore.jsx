import React from 'react'

const title = 'Explore'
const subtitle = 'The internet has a lot of graph knowledge.'
const content = (
  <React.Fragment>
    <section className='step'>
      <h2>Participate in a thriving community</h2>
      <img src='./assets/images/community.jpg' />
      <p>
        Neo4j has a growing worldwide community of users, contributors and
        partners. Join in to learn from others, and share your own insights.
      </p>
      <ul>
        <li>
          <a
            target='_blank'
            href='http://stackoverflow.com/questions/tagged/neo4j'
            className='external'
          >
            Stack Overflow
          </a>{' '}
          for
          <em>Q</em>
          uestions and
          <em>A</em>
          nswers
        </li>
        <li>
          <a
            target='_blank'
            href='http://groups.google.com/group/neo4j'
            className='external'
          >
            Google Groups
          </a>{' '}
          to discuss general Neo4j topics
        </li>
        <li>
          <a
            target='_blank'
            href='http://neo4j.meetup.com'
            className='external'
          >
            Meetup.com
          </a>{' '}
          for face-to-face interaction with peers
        </li>
        <li>
          <a
            target='_blank'
            href='http://github.com/neo4j'
            className='external'
          >
            Github
          </a>{' '}
          for open source code contributions
        </li>
      </ul>
      <p className='hint'>Graphistas are everywhere.</p>
    </section>
    <section className='step'>
      <h2>Watch videos</h2>
      <img src='./assets/images/watch.png' />
      <ul>
        <li>
          <a
            target='_blank'
            href='http://watch.neo4j.org/video/58186636'
            className='external'
          >
            Intro to Neo4j
          </a>{' '}
          for a gentle introduction
        </li>
        <li>
          <a
            target='_blank'
            href='http://watch.neo4j.org/video/57174859'
            className='external'
          >
            Cypher for SQL Professionals
          </a>{' '}
          if you're familiar with RDBMS
        </li>
        <li>
          <a target='_blank' href='http://watch.neo4j.org' className='external'>
            Watch
          </a>
          all of the latest videos
        </li>
      </ul>
      <p className='hint'>
        Coming soon: a full length movie starring Johnny Depp as Il Grafico.
      </p>
    </section>
    <section className='step'>
      <h2>Read in-depth material</h2>
      <img src='./assets/images/books.png' />
      <ul>
        <li>
          <a
            target='_blank'
            href='https://neo4j.com/docs/'
            className='external'
          >
            Neo4j Documentation
          </a>{' '}
          - the official documentation library
        </li>
        <li>
          <a
            target='_blank'
            href='http://graphdatabases.com/'
            className='external'
          >
            Graph Databases
          </a>{' '}
          - the definitive book
        </li>
        <li>
          <a
            target='_blank'
            href='http://www.manning.com/partner/'
            className='external'
          >
            Neo4j in Action
          </a>{' '}
          - a practical approach
        </li>
      </ul>
      <ul>
        <li>
          <a target='_blank' href='http://blog.neo4j.org' className='external'>
            Neo4j Blog
          </a>{' '}
          - latest information
        </li>
        <li>
          <a target='_blank' href='http://maxdemarzi.com' className='external'>
            Max de Marzi
          </a>{' '}
          - a practioner's blog
        </li>
      </ul>
      <p className='hint'>
        Your brain is a graph. Graph thinking will make it happy.
      </p>
    </section>
  </React.Fragment>
)

export default { title, subtitle, content }
