import React from 'react'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'
import Section from 'grommet/components/Section'
import Paragraph from 'grommet/components/Paragraph'
import Heading from 'grommet/components/Heading'
import Header from 'grommet/components/Footer'

const P = (props) => {
  return <Paragraph {...props} size='small' />
}
const About = () => {
  return (
    <Drawer id='db-about'>
      <DrawerHeader title='About Neo4j' />
      <DrawerBody>
        <Section>
          <Heading tag='h5'>
            Made by Neo Technology
          </Heading>
          <P>
            Copyright &#169; 2002-2017
          </P>
        </Section>
        <Section>
          <Heading tag='h5'>
            Neo4j Browser
          </Heading>
          <P>
            You are running version PRE-RELEASE
          </P>
        </Section>
        <Section>
          <Heading tag='h5'>
            License
          </Heading>
          <P>
            GPLv3 or AGPL for Open Source, and NTCL Commercial.
          </P>
        </Section>
        <Section>
          <Heading tag='h5'>
            Participate
          </Heading>
          <P>
            Ask questions at Stack Overflow
            Discuss Neo4j on Slack or Google Groups
            Visit a local Meetup Group
            Contribute code to Neo4j or Neo4j Browser
            Send us your Browser feedback via email
          </P>
        </Section>
        <Section>
          <Heading tag='h5'>
            Thanks
          </Heading>
          <P>
            Neo4j wouldn't be possible without a fantastic community. Thanks for all the feedback, discussions and contributions.
          </P>
        </Section>
        <Header>
          <P margin='none'>
           With &#9829; from Sweden.
          </P>
        </Header>
      </DrawerBody>
    </Drawer>
  )
}
export default About
