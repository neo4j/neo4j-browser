/*
 * Copyright (c) "Neo4j"
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

import { BuiltInGuideSidebarSlide } from '../../modules/Carousel/Slide'
import ManualLink from 'browser-components/ManualLink'
import { DrawerExternalLink } from 'browser-components/drawer/drawer-styled'

const title = 'Northwind Graph Guide'
const category = 'graphExamples'
const identifier = 'northwind-graph'
const slides = [
  <BuiltInGuideSidebarSlide key="s1">
    <p className="lead">
      <em>From RDBMS to Graph using a classic dataset</em>
    </p>
    <p>
      The <em>Northwind Graph</em> demonstrates how to migrate from a relational
      database to Neo4j. The transformation is iterative and deliberate,
      emphasizing the conceptual shift from relational tables to nodes and
      relationships.
    </p>
    <p>This guide shows how to:</p>
    <ol className="big">
      <li>
        <b>Load:</b> Load data from external CSV files.
      </li>
      <li>
        <b>Index:</b> Index nodes based on their labels.
      </li>
      <li>
        <b>Relate:</b> Transform foreign key references into data relationships.
      </li>
      <li>
        <b>Promote:</b> Transform join records into relationships.
      </li>
    </ol>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>Load product catalog</h3>
    <p className="lead">
      <em>Load the product catalog data from external CSV files</em>
    </p>
    <p>
      {`Northwind sells food products in a few categories provided by suppliers.
      Let's start by loading the product catalog tables.`}
    </p>
    <img
      src="./assets/images/northwind/product-category-supplier.png"
      className="img-responsive"
    />
    <p>
      The load statements to the right require public internet access.
      <code>LOAD CSV</code> retrieves a CSV file from a valid URL by applying a
      Cypher statement to each row using a named map. This example uses the name{' '}
      <code>row</code>.
    </p>
    <hr />
    <ul className="undecorated">
      <li>
        Load product data.
        <pre className="pre-scrollable code runnable">
          {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/products.csv" AS row
CREATE (n:Product)
SET n = row,
n.unitPrice = toFloat(row.unitPrice),
n.unitsInStock = toInteger(row.unitsInStock), n.unitsOnOrder = toInteger(row.unitsOnOrder),
n.reorderLevel = toInteger(row.reorderLevel), n.discontinued = (row.discontinued <> "0")`}
        </pre>
      </li>
      <li>
        Load category data.
        <pre className="pre-scrollable code runnable">
          {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/categories.csv" AS row
CREATE (n:Category)
SET n = row`}
        </pre>
      </li>
      <li>
        Load supplier data.
        <pre className="pre-scrollable code runnable">
          {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/suppliers.csv" AS row
CREATE (n:Supplier)
SET n = row`}
        </pre>
      </li>
    </ul>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="load-csv">LOAD CSV</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s3">
    <h3>Index product catalog data</h3>
    <p className="lead">
      <em>Create node indexes based on labels</em>
    </p>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (p:Product) ON (p.productID)
    </pre>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (p:Product) ON (p.productName)
    </pre>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (c:Category) ON (c.categoryID)
    </pre>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (s:Supplier) ON (s.supplierID)
    </pre>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="create-index">CREATE INDEX</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s4">
    <h3>Relate product catalog data</h3>
    <p className="lead">
      <em>Transform foreign key references into data relationships</em>
    </p>
    <p>
      {`The products, categories, and suppliers are related through foreign key
      references. Let's promote those to data relationships to realize the
      graph.`}
    </p>
    <img
      src="./assets/images/northwind/product-graph.png"
      className="img-responsive"
    />
    <pre className="pre-scrollable code runnable">
      {`MATCH (p:Product),(c:Category)
WHERE p.categoryID = c.categoryID
CREATE (p)-[:PART_OF]->(c)`}
    </pre>
    <pre className="pre-scrollable code runnable">
      {`MATCH (p:Product),(s:Supplier)
WHERE p.supplierID = s.supplierID
CREATE (s)-[:SUPPLIES]->(p)`}
    </pre>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="match">MATCH</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s5">
    <h3>Query product data</h3>
    <p className="lead">
      <em>Query patterns</em>
    </p>
    <p>Lets try some queries using patterns.</p>
    <img
      src="./assets/images/northwind/product-graph.png"
      className="img-responsive"
    />
    <hr />
    <ul className="undecorated">
      <li>
        What categories of food does each supplier supply?
        <pre className="pre-scrollable code runnable">
          {`MATCH (s:Supplier)-->(:Product)-->(c:Category)
RETURN s.companyName as Company, collect(distinct c.categoryName) as Categories`}
        </pre>
      </li>
      <li>
        Find the produce suppliers.
        <pre className="pre-scrollable code runnable">
          {`MATCH (c:Category {categoryName:"Produce"})<--(:Product)<--(s:Supplier)
RETURN DISTINCT s.companyName as ProduceSuppliers`}
        </pre>
      </li>
    </ul>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="match">MATCH</a> <a help-topic="return">RETURN</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s6">
    <h3>Load customer orders</h3>
    <p className="lead">
      <em>Load customer orders data from external CSV files</em>
    </p>
    <p>Northwind customers place orders, which may detail multiple products.</p>
    <img
      src="./assets/images/northwind/customer-orders.png"
      className="img-responsive"
    />
    <ul className="undecorated">
      <li>
        Load customer data.
        <pre className="pre-scrollable code runnable">
          {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/customers.csv" AS row
CREATE (n:Customer)
SET n = row`}
        </pre>
      </li>
      <li>
        Load order data.
        <pre className="pre-scrollable code runnable">
          {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/orders.csv" AS row
CREATE (n:Order)
SET n = row`}
        </pre>
      </li>
    </ul>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="load-csv">LOAD CSV</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s7">
    <h3>Index customer orders data</h3>
    <p className="lead">
      <em>Create node indexes based on label</em>
    </p>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (n:Customer) ON (n.customerID)
    </pre>
    <pre className="pre-scrollable code runnable">
      CREATE INDEX FOR (o:Order) ON (o.orderID)
    </pre>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="create-index">CREATE INDEX</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s8">
    <h3>Relate customer orders data</h3>
    <p className="lead">
      <em>Create releationships between customers and orders</em>
    </p>
    <pre className="pre-scrollable code runnable">
      {`MATCH (n:Customer),(o:Order)
WHERE n.customerID = o.customerID
CREATE (n)-[:PURCHASED]->(o)`}
    </pre>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="create">CREATE</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s9">
    <h3>Promote customer orders data</h3>
    <p className="lead">
      <em>Transform join records into relationships</em>
    </p>
    <p>
      Notice that <b>Order Details</b> are always part of an order and that they{' '}
      <i>relate</i> the Order to a Product — they are a join table. Join tables
      are always a sign of a data relationship, indicating shared information
      between two other records.
    </p>
    <p>
      Here, you directly promote each <code>OrderDetail</code> record into a
      relationship in the graph.
    </p>
    <img
      src="./assets/images/northwind/order-graph.png"
      className="img-responsive"
    />
    <pre className="pre-scrollable code runnable">
      {`LOAD CSV WITH HEADERS FROM "https://data.neo4j.com/northwind/order-details.csv" AS row
MATCH (p:Product), (o:Order)
WHERE p.productID = row.productID AND o.orderID = row.orderID
CREATE (o)-[details:ORDERS]->(p)
SET details = row,
details.quantity = toInteger(row.quantity)`}
    </pre>
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="match">MATCH</a> <a help-topic="load-csv">LOAD CSV</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s10">
    <h3>Query the Northwind graph</h3>
    <p className="lead">
      <em>Query patterns</em>
    </p>
    <p>
      How many products did each customer purchase?
      <pre className="pre-scrollable code runnable">
        {`MATCH (cust:Customer)-[:PURCHASED]->(:Order)-[o:ORDERS]->(p:Product),
  (p)-[:PART_OF]->(c:Category {categoryName:"Produce"})
RETURN DISTINCT cust.contactName as CustomerName, SUM(o.quantity) AS TotalProductsPurchased`}
      </pre>
    </p>
    <hr />
    <p>
      <a help-topic="help">:help</a> <a help-topic="cypher">cypher</a>{' '}
      <a help-topic="match">MATCH</a> <a help-topic="return">RETURN</a>
    </p>
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s11">
    <h3>Reference</h3>
    <ul className="undecorated">
      <li>
        <DrawerExternalLink href="https://neo4j.com/developer/guide-importing-data-and-etl/">
          Full Northwind import example
        </DrawerExternalLink>
      </li>
      <li>
        <ManualLink chapter="cypher-manual" page="/">
          Neo4j Cypher Manual
        </ManualLink>
      </li>
      <li>
        <ManualLink chapter="cypher-refcard" page="/">
          Cypher Refcard
        </ManualLink>
      </li>
      <li>
        <DrawerExternalLink href="https://neo4j.com/developer/">
          Developer resources
        </DrawerExternalLink>
      </li>
    </ul>
  </BuiltInGuideSidebarSlide>
]

export default { title, category, identifier, slides }
