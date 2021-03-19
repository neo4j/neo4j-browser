import React from 'react'
const title = 'sandboxMovies'

const slides = [
  <div key="first" className="row-fluid">
    <div className="col-sm-12">
      <h3>What is Cypher?</h3>
      <br />
      <div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            Cypher is a graph query language that is used to query the Neo4j
            Database. Just like you use SQL to query a MySQL database, you would
            use Cypher to query the Neo4j Database.
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            A simple cypher query can look something like this
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              Match (m:Movie) where m.released &gt; 2000 RETURN m limit 5
            </pre>
          </div>
        </div>
        <div
          style={{
            background: '#5CA6D9EE',
            padding: '12px',
            color: 'white',
            borderRadius: '2px'
          }}
        >
          Hint: You can click on the query above to populate it in the editor.
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Expected Result</strong>: The above query will return all
            the movies that were released after the year 2000 limiting the
            result to 5 items.
          </p>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style={{
                background: '#fff',
                padding: '12px',
                marginBottom: '24px'
              }}
              src="./index_files/5-movies.svg"
              alt="5 movies"
              width="100%"
            />
          </div>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li
              style={{
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: '28px'
              }}
            >
              <p>
                Write a query to retrieve all the movies released after the year
                2005.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    Match (m:Movie) where m.released &gt; 2005 RETURN m
                  </pre>
                </div>
              </div>
            </li>
            <li
              style={{
                marginBottom: '24px',
                fontSize: '16px',
                lineHeight: '28px'
              }}
            >
              <p>
                Write a query to return the count of movies released after the
                year 2005. (Hint: you can use the <code>count(m)</code> function
                to return the count)
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    Match (m:Movie) where m.released &gt; 2005 RETURN count(m)
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="second" className="row-fluid">
    <div className="col-sm-12">
      <h3>Nodes and Relationships</h3>
      <br />
      <div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            Nodes and Relationships are the basic building blocks of a graph
            database.
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Nodes</strong>
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            Nodes represent entities. A node in graph database is similar to a
            row in a relational database. In the picture below we can see 2
            kinds of nodes - <code>Person</code> and <code>Movie</code>. In
            writing a cypher query, a node is enclosed between a parenthesis —
            like <code>(p:Person)</code> where <code>p</code> is a variable and{' '}
            <code>Person</code> is the type of node it is referring to.
          </p>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style={{
                background: '#fff',
                padding: '12px',
                marginBottom: '24px'
              }}
              src="./index_files/schema.svg"
              alt="schema"
              width="100%"
            />
          </div>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Relationship</strong>
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            Two nodes can be connected with a relationship. In the above image{' '}
            <code>ACTED_IN</code>, <code>REVIEWED</code>, <code>PRODUCED</code>,{' '}
            <code>WROTE</code> and <code>DIRECTED</code> are all relationships
            connecting the corresponding types of nodes.
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            In writing a cypher query, relationships are enclosed in square
            brackets - like <code>[w:WORKS_FOR]</code> where <code>w</code> is a
            variable and <code>WORKS_FOR</code> is the type of relationship it
            is referring to.
          </p>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            Two nodes can be connected with more than one relationships.
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person)-[d:DIRECTED]-(m:Movie) where m.released &gt; 2010
              RETURN p,d,m
            </pre>
          </div>
        </div>
        <div
          style={{
            background: '#5CA6D9EE',
            padding: '12px',
            color: 'white',
            borderRadius: '2px'
          }}
        >
          Hint: You can click on the query above to populate it in the editor.
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Expected Result</strong>: The above query will return all
            Person nodes who directed a movie that was released after 2010.
          </p>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style={{
                background: '#fff',
                padding: '12px',
                marginBottom: '24px'
              }}
              src="./index_files/movies-after-2010.svg"
              alt="movies after 2010"
              width="100%"
            />
          </div>
        </div>
        <div className="paragraph">
          <p
            style={{
              marginTop: '12px',
              marginBottom: '24px',
              fontSize: '16px',
              lineHeight: '28px'
            }}
          >
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li
              style={{
                marginBottom: '12px',
                fontSize: '16px',
                lineHeight: '28px;'
              }}
            >
              b
              <p>
                Query to get all the people who acted in a movie that was
                released after 2010.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person)-[d:ACTED_IN]-(m:Movie) where m.released
                    &gt; 2010 RETURN p,d,m
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
  /*
  ,<div key="third" className="row-fluid">
    <div className="col-sm-12">
      <h3>Labels</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style={{marginTop: '12px',  marginBottom: '24px',fontSize: '16px', lineHeight: "28px"}}>
            Labels is a name or identifer of a Node or a Relationship. In the
            image below <code>Movie</code> and <code>Person</code> are Node
            labels and <code>ACTED_IN</code>, <code>REVIEWED</code>, etc are
            Relationship labels.
          </p>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style="background: #fff; padding: 12px; margin-bottom: 24px;"
              src="./index_files/schema.svg"
              alt="schema"
              width="100%"
            />
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            In writing a cypher query, Labels are prefixed with a colon - like{' '}
            <code>:Person</code> or <code>:ACTED_IN</code>. You can assign the
            node label to a variable by prefixing the syntax with the variable
            name. Like <code>(p:Person)</code> means <code>p</code> variable
            denoted <code>Person</code> labeled nodes.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Labels are used when you want to perform operations only on a
            specific types of Nodes. Like
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person) RETURN p limit 20
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            will return only <code>Person</code> Nodes (limiting to 20 items)
            while
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (n) RETURN n limit 20
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            will return all kinds of nodes (limiting to 20 items).
          </p>
        </div>
      </div>
    </div>
  </div>,
  <div key="forth" className="row-fluid">
    <div className="col-sm-12">
      <h3>Properties</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Properties are name-value pairs that are used to add attributes to
            nodes and relationships.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            To return specific properties of a node you can write -
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (m:Movie) return m.title, m.released
            </pre>
          </div>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style="background: #fff; padding: 12px; margin-bottom: 24px;"
              src="./index_files/movies-properties.jpg"
              alt="movies properties"
              width="100%"
            />
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Expected Result</strong> - This will return Movie nodes but
            with only the <code>title</code> and <code>released</code>{' '}
            properties.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Write a query to get <code>name</code> and <code>born</code>{' '}
                properties of the Person node.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person) return p.name, p.born
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="fifth" className="row-fluid">
    <div className="col-sm-12">
      <h3>Create a Node</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <code>Create</code> clause can be used to create a new node or a
            relationship.
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              Create (p:Person {'{'}name: "John Doe"{'}'}) RETURN p
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            The above statement will create a new <code>Person</code> node with
            property <code>name</code> having value <code>John Doe</code>.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Create a new <code>Person</code> node with a property{' '}
                <code>name</code> having the value of your name.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    Create (p:Person {'{'}name: "&lt;Your Name&gt;"{'}'}) RETURN
                    p
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="6" className="row-fluid">
    <div className="col-sm-12">
      <h3>
        Finding Nodes with <strong>Match</strong> and <strong>Where</strong>{' '}
        Clause
      </h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <code>Match</code> clause is used to find nodes that match a
            particular pattern. This is the primary way of getting data from a
            Neo4j database.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            In most cases, a <code>Match</code> is used along with certain
            conditions to narrow down the result.
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              Match (p:Person {'{'}name: "Tom Hanks"{'}'}) RETURN p
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            This is one way of doing it. Although you can only do basic string
            match based filtering this way (without using <code>WHERE</code>{' '}
            clause).
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Another way would be to use a <code>WHERE</code> clause which allows
            for more complex filtering including <code>&gt;</code>,{' '}
            <code>&lt;</code>, <code>Starts With</code>, <code>Ends With</code>,
            etc
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person) where p.name = "Tom Hanks" RETURN p
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Both of the above queries will return the same results.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            You can read more about Where clause and list of all filters here -{' '}
            <a
              href="https://neo4j.com/docs/cypher-manual/4.1/clauses/where/"
              className="bare"
            >
              https://neo4j.com/docs/cypher-manual/4.1/clauses/where/
            </a>
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>Find the movie with title "Cloud Atlas"</p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (m:Movie {'{'}title: "Cloud Atlas"{'}'}) return m
                  </pre>
                </div>
              </div>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Get all the movies that were released between 2010 and 2015.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (m:Movie) where m.released &gt; 2010 and m.released
                    &lt; 2015 RETURN m
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="7" className="row-fluid">
    <div className="col-sm-12">
      <h3>Merge Clause</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            The <code>Merge</code> clause is used to either
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>match the existing nodes and bind them or</p>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>create new node(s) and bind them</p>
            </li>
          </ol>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            It is a combination of <code>Match</code> and <code>Create</code>{' '}
            and additionally allows to specify additional actions if the data
            was matched or created.
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MERGE (p:Person {'{'}name: "John Doe"{'}'}) ON MATCH SET
              p.lastLoggedInAt = timestamp() ON CREATE SET p.createdAt =
              timestamp() Return p
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style={{margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            The above statement will create the Person node if it does not
            exist. If the node already exists, then it will set the property{' '}
            <code>lastLoggedInAt</code> to the current timestamp. If node did
            not exist and was newly created instead, then it will set the{' '}
            <code>createdAt</code> property to the current timestamp.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Write a query using Merge to create a movie node with title
                "Greyhound". If the node does not exist then set its{' '}
                <code>released</code> property to 2020 and{' '}
                <code>lastUpdatedAt</code> property to the current time stamp.
                If the node already exists, then only set{' '}
                <code>lastUpdatedAt</code> to the current time stamp. Return the
                movie node.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MERGE (m:movie {'{'}title: "Greyhound"{'}'}) ON MATCH SET
                    m.lastUpdatedAt = timestamp() ON CREATE SET m.released =
                    "2020", m.lastUpdatedAt = timestamp() Return m
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="8" className="row-fluid">
    <div className="col-sm-12">
      <h3>Create a Relationship</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            A Relationship connects 2 nodes.
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person), (m:Movie) WHERE p.name = "Tom Hanks" and m.title
              = "Cloud Atlas" CREATE (p)-[w:WATCHED]-&gt;(m) RETURN type(w)
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            The above statement will create a relationship <code>:WATCHED</code>{' '}
            between the existing <code>Person</code> and <code>Movie</code>{' '}
            nodes and return the type of relationship (i.e <code>WATCHED</code>
            ).
          </p>
        </div>
        <div className="paragraph">
          <p style="{{margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style=margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Create a relationship <code>:WATCHED</code> between the node you
                created for yourself previously in step 6 and the movie{' '}
                <strong>Cloud Atlas</strong> and then return the type of created
                relationship
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person), (m:Movie) WHERE p.name = "&lt;Your
                    Name&gt;" and m.title = "Cloud Atlas" CREATE
                    (p)-[w:WATCHED]-&gt;(m) RETURN type(w)
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="9" className="row-fluid">
    <div className="col-sm-12">
      <h3>Relationship Types</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            In Neo4j, there can be 2 kinds of relationships -{' '}
            <strong>incoming</strong> and <strong>outgoing</strong>.
          </p>
        </div>
        <div className="imageblock">
          <div className="content">
            <img
              style={{background: #fff; padding: 12px; margin-bottom: 24px;"
              src="./index_files/relationship-types.svg"
              alt="relationship types"
              width="400"
            />
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            In the above picture, the Tom Hanks node is said to have an outgoing
            relationship while Forrest Gump node is said to have an incoming
            relationship.
          </p>
        </div>
        <div className="paragraph">
          <p style="{{margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Relationships always have a direction. However, you only have to pay
            attention to the direction where it is useful.
          </p>
        </div>
        <div className="paragraph">
          <p style=margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            To denote an outgoing or an incoming relationship in cypher, we use{' '}
            <code>&#8594;</code> or <code>&#8592;</code>.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Example -
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person)-[r:ACTED_IN]-&gt;(m:Movie) RETURN p,r,m
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="{{margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            In the above query Person has an outgoing relationship and movie has
            an incoming relationship.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Although, in the case of the movies dataset, the direction of the
            relationship is not that important and even without denoting the
            direction in the query, it will return the same result. So the query
            -
          </p>
        </div>
        <div className="listingblock">
          <div className="content">
            <pre
              mode="cypher"
              className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
              data-lang="cypher"
              lang="cypher"
            >
              MATCH (p:Person)-[r:ACTED_IN]-(m:Movie) RETURN p,r,m
            </pre>
          </div>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            will return the same result as the above one.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            <strong>Try</strong>
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Write a query to find the nodes <code>Person</code> and{' '}
                <code>Movie</code> which are connected by <code>REVIEWED</code>{' '}
                relationship and is outgoing from the <code>Person</code> node
                and incoming to the <code>Movie</code> node.
              </p>
              <div className="listingblock try-cypher-result">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person)-[r:REVIEWED]-(m:Movie) return p,r,m
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>,
  <div key="10" className="row-fluid">
    <div className="col-sm-12">
      <h3>Advance Cypher queries</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Let�s look at some questions that you can answer with cypher
            queries.
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                <strong>Finding who directed Cloud Atlas movie</strong>
              </p>
              <div className="listingblock">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (m:Movie {'{'}title: "Cloud Atlas"{'}'}
                    )&lt;-[d:DIRECTED]-(p:Person) return p.name
                  </pre>
                </div>
              </div>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                <strong>
                  Finding all people who have co-acted with Tom Hanks in any
                  movie
                </strong>
              </p>
              <div className="listingblock">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (tom:Person {'{'}name: "Tom Hanks"{'}'}
                    )-[:ACTED_IN]-&gt;(:Movie)&lt;-[:ACTED_IN]-(p:Person) return
                    p.name
                  </pre>
                </div>
              </div>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                <strong>
                  Finding all people related to the movie Cloud Atlas in any way
                </strong>
              </p>
              <div className="listingblock">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person)-[relatedTo]-(m:Movie {'{'}title: "Cloud
                    Atlas"{'}'}) return p.name, type(relatedTo)
                  </pre>
                </div>
              </div>
              <div className="paragraph">
                <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
                  In the above query we only used the variable{' '}
                  <code>relatedTo</code> which will try to find all the
                  relationships between any <code>Person</code> node and the
                  movie node "Cloud Atlas"
                </p>
              </div>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                Finding Movies and Actors that are 3 hops away from Kevin Bacon.
              </p>
              <div className="listingblock">
                <div className="content">
                  <pre
                    mode="cypher"
                    className="highlight pre-scrollable programlisting cm-s-neo code runnable standalone-example ng-binding"
                    data-lang="cypher"
                    lang="cypher"
                  >
                    MATCH (p:Person {'{'}name: "Kevin Bacon"{'}'}
                    )-[*1..3]-(hollywood) return DISTINCT p, hollywood
                  </pre>
                </div>
              </div>
            </li>
          </ol>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Note: in the above query, <code>hollywood</code> refers to any node
            in the database (in this case <code>Person</code> and{' '}
            <code>Movie</code> nodes)
          </p>
        </div>
      </div>
    </div>
  </div>,
  <div key="11" className="row-fluid">
    <div className="col-sm-12">
      <h3>Great Job!</h3>
      <br />
      <div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Now you know the basics of writing cypher query. You are on your way
            to becoming a graphista! Congratulations.
          </p>
        </div>
        <div className="paragraph">
          <p style="margin-top: 12px; margin-bottom: 24px; font-size: 16px; line-height: 28px;">
            Feel free to play around with the data by writing more cypher
            queries. If you want to learn more about cypher, you can use one of
            the below resources -
          </p>
        </div>
        <div className="olist arabic">
          <ol className="arabic">
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                <a href="https://neo4j.com/docs/cypher-manual/4.0/">
                  Cypher Manual
                </a>{' '}
                - detailed manual on cypher syntax
              </p>
            </li>
            <li style="margin-bottom: 12px; font-size: 16px; line-height: 28px;">
              <p>
                <a href="https://neo4j.com/graphacademy/online-training/v4/00-intro-neo4j-about/">
                  Online Training - Introduction to Neo4j
                </a>{' '}
                - If you are new to Neo4j and like to learn through an online
                className, this is the best place to get started.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
            */
]

export default { title, slides }
