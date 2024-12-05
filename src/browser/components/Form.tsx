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

export function Input({ className = '', type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const baseClasses = type === 'checkbox' 
    ? 'mr-2 align-middle w-auto'
    : 'w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent'
    
  return (
    <input 
      className={`${baseClasses} ${className}`}
      type={type}
      {...props}
    />
  )
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select 
      className={`w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  )
}

export function Label({ className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label 
      className={`block text-sm font-medium text-foreground capitalize mb-1 ${className}`}
      {...props}
    />
  )
}

export function Form({ className = '', ...props }: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form 
      className={`w-full ${className}`}
      {...props}
    />
  )
}

export function FormElement({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`mb-4 ${className}`}
      {...props}
    />
  )
}

export function FormElementWrapper({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`flex space-x-2.5 [&>div]:flex-grow ${className}`}
      {...props}
    />
  )
}

interface RadioSelectorProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: string[]
  selectedValue?: string
  className?: string
}

export function RadioSelector({ onChange, options, selectedValue, className = '' }: RadioSelectorProps) {
  return (
    <form className={className}>
      {options.map(option => (
        <div key={option} className="my-2.5">
          <input
            type="radio"
            value={option}
            id={option}
            checked={option === selectedValue}
            onChange={onChange}
            className="mr-2.5"
          />
          <label 
            htmlFor={option}
            className="inline-block font-normal capitalize"
          >
            {option}
          </label>
        </div>
      ))}
    </form>
  )
}

export function CheckboxSelector({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      type="checkbox" 
      className={`mr-2.5 ${className}`}
      {...props}
    />
  )
}
