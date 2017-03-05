import React from 'react'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'
import {H5} from 'nbnmui/headers'

const About = () => {
  return (
    <Drawer id='db-about'>
      <DrawerHeader title='About Neo4j' />
      <DrawerBody>
        <H5>
          Made by Neo Technology
        </H5>
        <p>
          Copyright &#169; 2002-2017
        </p>
        <H5>
          Neo4j Browser
        </H5>
        <p>
          You are running version pRE-RELEASE
        </p>
        <H5>
          License
        </H5>
        <p>
          GpLv3 or AGpL for Open Source, and NTCL Commercial.
        </p>
        <H5>
          participate
        </H5>
        <p>
          Ask questions at Stack Overflow
          Discuss Neo4j on Slack or Google Groups
          Visit a local Meetup Group
          Contribute code to Neo4j or Neo4j Browser
          Send us your Browser feedback via email
        </p>
        <H5>
          Thanks
        </H5>
        <p>
          Neo4j wouldn't be possible without a fantastic community. Thanks for all the feedback, discussions and contributions.
        </p>
        <p>
         With &#9829; from Sweden.
        </p>
      </DrawerBody>
    </Drawer>
  )
}
export default About
