import {Drawer, DrawerBody, DrawerHeader} from 'browser-components/drawer'
import {DrawerSubHeader, DrawerSection, DrawerSectionBody} from 'browser-components/drawer'

const About = () => {
  return (
    <Drawer id='db-about'>
      <DrawerHeader>About Neo4j</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSubHeader>
            Made by Neo Technology
          </DrawerSubHeader>
        </DrawerSection>
        <DrawerSection>
          <DrawerSectionBody>
            Copyright &#169; 2002-2017
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            Neo4j Browser
          </DrawerSubHeader>
          <DrawerSectionBody>
            You are running version PRE-RELEASE
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            License
          </DrawerSubHeader>
          <DrawerSectionBody>
            GPLv3 or AGPL for Open Source, and NTCL Commercial.
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            Participate
          </DrawerSubHeader>
          <DrawerSectionBody>
            Ask questions at Stack Overflow
            Discuss Neo4j on Slack or Google Groups
            Visit a local Meetup Group
            Contribute code to Neo4j or Neo4j Browser
            Send us your Browser feedback via email
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            Thanks
          </DrawerSubHeader>
          <DrawerSectionBody>
            Neo4j wouldn't be possible without a fantastic community. Thanks for all the feedback, discussions and contributions.
          </DrawerSectionBody>
          <DrawerSectionBody>
           With &#9829; from Sweden.
          </DrawerSectionBody>
        </DrawerSection>
      </DrawerBody>
    </Drawer>
  )
}
export default About
