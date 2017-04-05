import {Drawer, DrawerBody, DrawerHeader, DrawerSubHeader, DrawerSection, DrawerSectionBody, DrawerFooter} from 'browser-components/drawer'

const About = () => {
  return (
    <Drawer id='db-about'>
      <DrawerHeader>About Neo4j</DrawerHeader>
      <DrawerBody>
        <DrawerSection>
          <DrawerSubHeader>
            Made by <a target='_blank' href='http://neotechnology.com/'>Neo Technology</a>
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
            You are running version 3.0.0-alpha01
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            License
          </DrawerSubHeader>
          <DrawerSectionBody>
            <a target='_blank' href='http://www.gnu.org/licenses/gpl.html'>GPLv3</a> or <a target='_blank' href='http://www.gnu.org/licenses/agpl-3.0.html'>AGPL</a> for Open Source, and <a target='_blank' href='https://neo4j.com/licensing/'>NTCL</a> Commercial.
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            Participate
          </DrawerSubHeader>
          <DrawerSectionBody>
            Ask questions at <a target='_blank' href='http://stackoverflow.com/questions/tagged/neo4j'>Stack Overflow</a><br />
            Discuss Neo4j on <a target='_blank' href='http://neo4j.com/slack'>Slack</a> or <a target='_blank' href='http://groups.google.com/group/neo4j'>Google Groups</a><br />
            Visit a local <a target='_blank' href='http://neo4j.meetup.com/'>Meetup Group</a><br />
            Contribute code to <a target='_blank' href='http://github.com/neo4j'>Neo4j</a> or <a target='_blank' href='http://github.com/neo4j/neo4j-browser'>Neo4j Browser</a><br />
            Send us your Browser feedback via <a href='mailto:browser@neotechnology.com'>email</a>
          </DrawerSectionBody>
        </DrawerSection>
        <DrawerSection>
          <DrawerSubHeader>
            Thanks
          </DrawerSubHeader>
          <DrawerSectionBody>
            Neo4j wouldn't be possible without a fantastic community. Thanks for all the feedback, discussions and contributions.
          </DrawerSectionBody>
          <DrawerFooter>
            <DrawerSectionBody>
             With &#9829; from Sweden.
            </DrawerSectionBody>
          </DrawerFooter>
        </DrawerSection>
      </DrawerBody>
    </Drawer>
  )
}
export default About
