import React, { Fragment } from 'react'
import Carousel from '../Carousel'

const slides = [
  <Fragment>
    <div className='col-sm-3'>
      <h3>Northwind Graph</h3>
      <p className='lead'>From RDBMS to Graph, using a classic dataset</p>
    </div>
    <div className='col-sm-9'>
      <p>
        The <em>Northwind Graph</em> demonstrates how to migrate from a
        relational database to Neo4j. The transformation is iterative and
        deliberate, emphasizing the conceptual shift from relational tables to
        the nodes and relationships of a graph.
      </p>
      <p>This guide will show you how to:</p>
      <ol className='big'>
        <li>Load: create data from external CSV files</li>
        <li>Index: index nodes based on label</li>
        <li>
          Relate: transform foreign key references into data relationships
        </li>
        <li>Promote: transform join records into relationships</li>
      </ol>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-3'>
      <h3>Product Catalog</h3>
      <p>
        Northwind sells food products in a few categories, provided by
        suppliers. Let's start by loading the product catalog tables.
      </p>
      <p>
        The load statements to the right require public internet access.
        <code>LOAD CSV</code> will retrieve a CSV file from a valid URL,
        applying a Cypher statement to each row using a named map (here we're
        using the name `row`).
      </p>
      <p>
        <img
          src='./assets/images/northwind/product-category-supplier.png'
          className='img-responsive'
        />
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic='cypher'>cypher</a>{' '}
        <a help-topic='load-csv'>LOAD CSV</a>
      </p>
    </div>
    <div className='col-sm-9'>
      <h4>Load records</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/products.csv" AS row
CREATE (n:Product)
SET n = row,
n.unitPrice = toFloat(row.unitPrice),
n.unitsInStock = toInteger(row.unitsInStock), n.unitsOnOrder = toInteger(row.unitsOnOrder),
n.reorderLevel = toInteger(row.reorderLevel), n.discontinued = (row.discontinued <> "0")`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/categories.csv" AS row
CREATE (n:Category)
SET n = row`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/suppliers.csv" AS row
CREATE (n:Supplier)
SET n = row`}</pre>
      </figure>
      <h4>Create indexes</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`CREATE INDEX ON :Product(productID)`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`CREATE INDEX ON :Category(categoryID)`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`CREATE INDEX ON :Supplier(supplierID)`}</pre>
      </figure>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-3'>
      <h3>Product Catalog Graph</h3>
      <p>
        The products, categories and suppliers are related through foreign key
        references. Let's promote those to data relationships to realize the
        graph.
      </p>
      <p>
        <img
          src='./assets/images/northwind/product-graph.png'
          className='img-responsive'
        />
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic='cypher'>cypher</a>{' '}
        <a help-topic='match'>MATCH</a>
      </p>
    </div>
    <div className='col-sm-9'>
      <h4>Create data relationships</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (p:Product),(c:Category)
WHERE p.categoryID = c.categoryID
CREATE (p)-[:PART_OF]->(c)`}</pre>
        <aside className='warn'>
          Note you only need to compare property values like this when first
          creating relationships
        </aside>
        <figcaption>
          Calculate join, materialize relationship. (See{' '}
          <a
            target='_blank'
            href='http://neo4j.com/developer/guide-importing-data-and-etl'
          >
            {' '}
            importing guide
          </a>{' '}
          for more details)
        </figcaption>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (p:Product),(s:Supplier)
WHERE p.supplierID = s.supplierID
CREATE (s)-[:SUPPLIES]->(p)`}</pre>
        <aside className='warn'>
          Note you only need to compare property values like this when first
          creating relationships
        </aside>
      </figure>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-3'>
      <h3>Querying Product Catalog Graph</h3>
      <p>Lets try some queries using patterns.</p>
      <p>
        <img
          src='./assets/images/northwind/product-graph.png'
          className='img-responsive'
        />
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic='cypher'>cypher</a>{' '}
        <a help-topic='match'>MATCH</a>
      </p>
    </div>
    <div className='col-sm-9'>
      <h4>Query using patterns</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (s:Supplier)-->(:Product)-->(c:Category)
RETURN s.companyName as Company, collect(distinct c.categoryName) as Categories`}</pre>
        <figcaption>
          List the product categories provided by each supplier.
        </figcaption>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (c:Category {categoryName:"Produce"})<--(:Product)<--(s:Supplier)
RETURN DISTINCT s.companyName as ProduceSuppliers`}</pre>
        <figcaption>Find the produce suppliers.</figcaption>
      </figure>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-3'>
      <h3>Customer Orders</h3>
      <p>
        Northwind customers place orders which may detail multiple products.
        <img
          src='./assets/images/northwind/customer-orders.png'
          className='img-responsive'
        />
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic='cypher'>cypher</a>{' '}
        <a help-topic='load-csv'>LOAD CSV</a>
      </p>
    </div>
    <div className='col-sm-9'>
      <h4>Load and index records</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/customers.csv" AS row
CREATE (n:Customer)
SET n = row`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/orders.csv" AS row
CREATE (n:Order)
SET n = row`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`CREATE INDEX ON :Customer(customerID)`}</pre>
      </figure>
      <figure>
        <pre className='pre-scrollable code runnable'>{`CREATE INDEX ON :Order(orderID)`}</pre>
      </figure>
      <h4>Create data relationships</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (c:Customer),(o:Order)
WHERE c.customerID = o.customerID
CREATE (c)-[:PURCHASED]->(o)`}</pre>
        <aside className='warn'>
          Note you only need to compare property values like this when first
          creating relationships
        </aside>
      </figure>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-3'>
      <h3>Customer Order Graph</h3>
      <p>
        Notice that Order Details are always part of an Order and that they{' '}
        <i>relate</i> the Order to a Product — they're a join table. Join tables
        are always a sign of a data relationship, indicating shared information
        between two other records.
      </p>
      <p>
        Here, we'll directly promote each OrderDetail record into a relationship
        in the graph.
        <img
          src='./assets/images/northwind/order-graph.png'
          className='img-responsive'
        />
      </p>
      <hr />
      <p>
        <small>:help</small> <a help-topic='cypher'>cypher</a>{' '}
        <a help-topic='load-csv'>LOAD CSV</a>
      </p>
    </div>
    <div className='col-sm-9'>
      <h4>Load and index records</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`LOAD CSV WITH HEADERS FROM "http://data.neo4j.com/northwind/order-details.csv" AS row
MATCH (p:Product), (o:Order)
WHERE p.productID = row.productID AND o.orderID = row.orderID
CREATE (o)-[details:ORDERS]->(p)
SET details = row,
details.quantity = toInteger(row.quantity)`}</pre>
        <aside className='warn'>
          Note you only need to compare property values like this when first
          creating relationships
        </aside>
      </figure>
      <h4>Query using patterns</h4>
      <figure>
        <pre className='pre-scrollable code runnable'>{`MATCH (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product),
  (p)-[:PART_OF]->(c:Category {categoryName:"Produce"})
RETURN DISTINCT cust.contactName as CustomerName, SUM(o.quantity) AS TotalProductsPurchased`}</pre>
      </figure>
    </div>
  </Fragment>,
  <Fragment>
    <div className='col-sm-4'>
      <h4>Northwind Graph</h4>
      <h3>Next steps</h3>
    </div>
    <div className='col-sm-4'>
      <h3>More code</h3>
      <ul className='undecorated'>
        <li>
          <a play-topic='movie-graph'>Movie Graph</a> - actors & movies
        </li>
        <li>
          <a play-topic='cypher'>Cypher</a> - query language fundamentals
        </li>
      </ul>
    </div>
    <div className='col-sm-4'>
      <h3>Reference</h3>
      <ul className='undecorated'>
        <li>
          <a
            target='_blank'
            href='https://neo4j.com/developer/guide-importing-data-and-etl/'
          >
            Full Northwind import example
          </a>
        </li>
        <li>
          <a target='_blank' href='https://neo4j.com/developer/'>
            Developer resources
          </a>
        </li>
        <li>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/3.2/'
          >
            Neo4j Developer Manual
          </a>
        </li>
      </ul>
    </div>
  </Fragment>
]

const content = (
  <Carousel className='deck container-fluid' slides={slides} withDirectives />
)

export default { content }
