###!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

getDocument = (content) ->
  {
    content: content
    folder: 'general',
    id: 'ssdf-sdfsdf-sdfsdf-sfsdf',
    name: 'Unnamed docuemnt'
  }

describe 'Utils', () ->



  # load the service's module
  beforeEach module 'neo4jApp.utils'

  # instantiate service
  Utils = {}
  beforeEach ->
    inject (_Utils_) ->
      Utils = _Utils_

  it 'should get first word in a multiword line', ->
    text = "multiple words here on one line"
    expect(Utils.firstWord text).toBe 'multiple'

  it 'should get first word in a multiline string', ->
    text = """
          cypher queries
          will often be more
          legible on multiple lines 
          than squashed onto a single line
          """
    expect(Utils.firstWord text).toBe 'cypher'

  it 'should get first word when it is alone in a multiline string', ->
    text = """
          alone
          on the first line but
          still extractable
          """
    expect(Utils.firstWord text).toBe 'alone'

  it 'should strip element "onX" attributes', ->
    text = '<a href="" onclick="alert(1) " onLoad="alert(2)">x</a>'
    expect(Utils.stripScripts text).toBe '<a href="">x</a>'

  it 'should strip script tags', ->
    text = 'hello<script>alert(1)</script>'
    expect(Utils.stripScripts text).toBe 'hello'

    text = 'hello<script src="xxx">'
    expect(Utils.stripScripts text).toBe 'hello'

    text = 'hello<script src="xxx" />'
    expect(Utils.stripScripts text).toBe 'hello'

    text = 'hello<script type="text/html">alert(1)</script>xxx<script> alert(3)</script  >'
    expect(Utils.stripScripts text).toBe 'helloxxx'

  it 'should strip ng attributes', ->
    text = '<p ng-show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p ng_show="false " style="color:red">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p style="color:red">x</p>'

    text = '<p data-ng-show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p data-ng_show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p data_ng_show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p ng:show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p data-ng:show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p data:ng:show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p x-ng-show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p x-ng_show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p x_ng_show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

    text = '<p x-ng:show="false">x</p>'
    expect(Utils.stripNGAttributes text).toBe '<p>x</p>'

  it 'should strip both script tags, onX anf ng-x attributes', ->
    text = 'hello<script>alert(1)</script> <p onclick="alert(1)" ng-show=\'false\'>xxx</p>'
    expect(Utils.cleanHTML text).toBe 'hello <p>xxx</p>'

  it 'should create hrefs from strings that are hyperlinks', ->
    testCases = [
      "http://test.com",
      "http://www.test.com",
      "https://test.com",
      "https://www.test.com",
      "http://test.com?a=b",
      "http://test.com/a/b"
    ]

    testCases.forEach (text) ->
      encodeUrl = Utils.escapeHTML text
      expect(Utils.replaceHyperlinkOrEncodeHTML text).toBe "<a href='#{text}' target='_blank'>#{encodeUrl}</a>"

  it 'should create hrefs from strings that contain hyperlinks', ->
    link = "http://test.com"
    link2 = "http://dsfasdfsd.com/random?fdsff=d"

    textBefore = "Text here #{link}"
    expect(Utils.replaceHyperlinkOrEncodeHTML textBefore).toContain "</a>"
    expect(Utils.replaceHyperlinkOrEncodeHTML textBefore).toContain "Text here"

    textAfter = "#{link} text there"
    expect(Utils.replaceHyperlinkOrEncodeHTML textAfter).toContain "</a>"
    expect(Utils.replaceHyperlinkOrEncodeHTML textAfter).toContain "text there"

    textBothSides = "Text here #{link} text there"
    expect(Utils.replaceHyperlinkOrEncodeHTML textBothSides).toContain "</a>"
    expect(Utils.replaceHyperlinkOrEncodeHTML textBothSides).toContain "Text here"
    expect(Utils.replaceHyperlinkOrEncodeHTML textBothSides).toContain "text there"

    textWithTwoLinks = "Text here #{link} text there #{link2} and again"
    expect(Utils.replaceHyperlinkOrEncodeHTML textWithTwoLinks).toContain "</a>"
    expect(Utils.replaceHyperlinkOrEncodeHTML textWithTwoLinks).toContain "Text here"
    expect(Utils.replaceHyperlinkOrEncodeHTML textWithTwoLinks).toContain "text there"
    expect(Utils.replaceHyperlinkOrEncodeHTML textWithTwoLinks).toContain "and again"

  it 'should respect whitelist for enterprise edition', ->
    host = 'http://first.com'
    whitelist = 'http://second.com,http://third.com'
    expect(Utils.hostIsAllowed host, '*', yes).toBe yes
    expect(Utils.hostIsAllowed host, host, yes).toBe yes
    expect(Utils.hostIsAllowed host, whitelist, yes).toBe no

  it 'should ignore whitelist for non enterprise editions', ->
    host = 'http://first.com'
    whitelist = 'http://second.com,http://third.com'
    expect(Utils.hostIsAllowed host, '*', no).toBe no
    expect(Utils.hostIsAllowed host, host, no).toBe no
    expect(Utils.hostIsAllowed host, whitelist, no).toBe no
    expect(Utils.hostIsAllowed 'http://guides.neo4j.com', whitelist, no).toBe yes

  it 'should merge two arrays with documents without duplicates', ->
    arr1 = [getDocument('MATCH (n) RETURN n'), getDocument('//My script\nRETURN "me"')]
    arr2 = [getDocument('MATCH (n)-(m) RETURN n'), getDocument('//My script\nRETURN "me"'), getDocument('RETURN 1')]
    expect(JSON.stringify(Utils.mergeDocumentArrays(arr1, arr2)))
      .toBe(JSON.stringify([getDocument('MATCH (n) RETURN n'), 
          getDocument('//My script\nRETURN "me"'), 
          getDocument('MATCH (n)-(m) RETURN n'),
          getDocument('RETURN 1')]))

  it 'should remove chosen documents from an array', ->
    toRemove = [getDocument('MATCH (n) RETURN n'), getDocument('//My script\nRETURN "me"')]
    removeFrom = [getDocument('MATCH (n)-(m) RETURN n'), getDocument('//My script\nRETURN "me"'), getDocument('RETURN 1')]
    expect(JSON.stringify(Utils.removeDocumentsFromArray(toRemove, removeFrom)))
      .toBe(JSON.stringify([getDocument('MATCH (n)-(m) RETURN n'), getDocument('RETURN 1')]))
