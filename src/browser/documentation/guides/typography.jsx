/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
const title = 'Typography'
const subtitle =
  'The typography is pleasantly minimal. Just enough to make for easy reading of brief content.'
const category = 'guides'
const content = (
  <>
    <div className="row">
      <div className="col-lg-4">
        <h3 className="hbaseline">Fonts</h3>
        <p>
          All regular text is in{' '}
          <a target="_blank" href="https://fonts.google.com/specimen/Open+Sans">
            Open Sans
          </a>
          , a &#8220;humanist sans serif typeface designed by Steve
          Matteson&#8220; for Google Fonts.
        </p>
        <p>
          Code appears in{' '}
          <a target="_blank" href="https://github.com/tonsky/FiraCode">
            Fira Code
          </a>
          , a &#8220;monospace font, designed for printed code listings and the
          like.&#8220;
        </p>
      </div>
      <div className="col-lg-4">
        <h3>Font Variants</h3>
        <p>
          For expressive text treatment there are classes for
          <span className="italic">.italic</span>,
          <span className="caps">.caps</span>,
          <span className="small">.small</span>,
          <span className="muted">.muted</span> and
          <span className="code">.code</span>, plus weights like
          <span className="light">.light</span>,
          <span className="semi-bold">.semi-bold</span>,
          <span className="bold">.bold</span>, and
          <span className="extra-bold">.extra-bold</span>.
        </p>
        <p>
          With caution you can use <code>.nobreak</code> to{' '}
          <span className="nobreak">
            write-hyphen-cased-words-that-wont-break
          </span>
          .
        </p>
      </div>
    </div>
    <hr />
    <div className="row">
      <div className="col-lg-4">
        <h2>Headings</h2>
        <p>
          There are also heading classes available the represent heading styles.
          This results in semantic HTML that still has the styling that you are
          looking for.
        </p>
        <p>
          <span className="h1">.h1</span>

          <span className="h2">.h2</span>

          <span className="h3">.h3</span>

          <span className="h4">.h4</span>

          <span className="h5">.h5</span>

          <span className="h6">.h6</span>
        </p>
      </div>
      <div className="col-lg-8">
        <h1>Does Size Change the Meaning of Words?</h1>
        <h2>Does Size Change the Meaning of Words?</h2>
        <h3>Does Size Change the Meaning of Words?</h3>
        <h4>Does Size Change the Meaning of Words?</h4>
        <h5>Does Size Change the Meaning of Words?</h5>
        <h6>Does Size Change the Meaning of Words?</h6>
      </div>
    </div>
    <hr />
    <div className="row">
      <div className="col-lg-2">
        <h1 className="vtop">H1 Top</h1>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
      <div className="col-lg-2">
        <h2 className="vtop">H2 Top</h2>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
      <div className="col-lg-2">
        <h3 className="vtop">H3 Top</h3>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
      <div className="col-lg-2">
        <h4 className="vtop">H4 Top</h4>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
      <div className="col-lg-2">
        <h5 className="vtop">H5 Top</h5>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
      <div className="col-lg-2">
        <h6 className="vtop">H6 Top</h6>
        <p>
          Add <code>.vtop</code> to align heading baselines.
        </p>
      </div>
    </div>
    <hr />
    <div className="row">
      <div className="col-lg-4">
        <h2 className="vtop">Lists</h2>
      </div>
      <div className="col-lg-4">
        <h5 className="vtop">Ordered</h5>
        <ol>
          <li>Nodes</li>
          <li>Relationships</li>
          <li>Properties</li>
          <li>Labels, Types, etc.</li>
        </ol>
      </div>
      <div className="col-lg-4">
        <h5 className="vtop">Unordered</h5>
        <ul>
          <li>Nodes</li>
          <li>Relationships</li>
          <li>Properties</li>
          <li>Labels, Types, etc.</li>
        </ul>
      </div>
    </div>
    <hr />
    <div className="row">
      <div className="col-lg-4">
        <h2 className="vtop">Code</h2>
        <p>
          Within body text, use <code>{'<code>'}</code> for citing Cypher
          keywords like <code>MERGE</code> or indicating key-combinations. Avoid
          code-snippets within a paragraph, preferring a code block.
        </p>
        <ul>
          <li>Within a list</li>
          <li>
            <code>MATCH</code> might appear
          </li>
          <li>mixed with other points</li>
        </ul>
      </div>
      <div className="col-lg-8">
        <h5 className="vtop">Code Block</h5>
        <p>Create a static block of Cypher using...</p>
        <pre>
          {
            '<figure><pre mode="cypher" className="code">>MATCH ... RETURN ... </pre></figure>'
          }
        </pre>
        <figure>
          <pre mode="cypher" className="pre-scrollable code">
            MATCH (tom:Person) WHERE tom.name = "Tom Hanks" RETURN tom
          </pre>
        </figure>
        <p>
          Make it clickable by adding the class <code>runnable</code>
          ...
        </p>
        <pre>
          {
            '<figure><pre mode="cypher" className="code runnable">MATCH ... RETURN ... </pre></figure>'
          }
        </pre>
        <figure>
          <pre mode="cypher" className="pre-scrollable code runnable">
            {
              'MATCH (tom:Person)-[r]->(movies) WHERE tom.name = "Tom Hanks" RETURN tom, r, movies'
            }
          </pre>
        </figure>
      </div>
    </div>
  </>
)

export default { title, subtitle, category, content }
