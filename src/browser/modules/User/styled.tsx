/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 */

export const buttonClasses = {
  base: 'py-1.5',
  statusIndicator: 'before:w-2.5 before:h-2.5 before:rounded-full before:inline-block before:mr-1.5 before:content-[""] before:bg-gray-200',
  statusActive: 'before:bg-success',
  statusSuspended: 'before:bg-warning'
} as const

export const rolesClasses = {
  base: 'flex flex-col',
  inline: 'flex-row items-start [&>button]:mr-1.5',
  notFirst: 'py-2.5',
  button: 'm-0 mb-1.5 last:mb-0'
} as const

export const tableClasses = {
  userTd: 'px-4 py-2.5',
  buttonContainer: 'py-1.5',
  table: 'w-full',
  th: 'p-2 text-left font-medium'
} as const
