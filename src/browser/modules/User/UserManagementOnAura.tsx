import React from 'react'

export default function UserManagementOnAura(): JSX.Element {
  return (
    <div>
      <p>
        User management is currently only available through cypher commands on
        Neo4j Aura Enterprise.
      </p>
      <p>
        Read more on user and role management with cypher on{' '}
        <a
          href="https://neo4j.com/docs/cypher-manual/current/administration/security/users-and-roles"
          target="_blank"
          rel="noreferrer"
        >
          the Neo4j Cypher docs.
        </a>
      </p>
    </div>
  )
}
