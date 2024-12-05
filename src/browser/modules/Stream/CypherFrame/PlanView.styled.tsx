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

export function PlanSvgWrapper({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`w-full overflow-x-auto bg-background ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function PlanStatusBar({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`flex items-center min-h-[39px] px-4 py-2 text-sm text-secondary-foreground ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function WarningMessage({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`text-warning font-medium ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function PlanSvg({ children, className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      className={`w-full h-full ${className}`}
      {...props}
    >
      {children}
    </svg>
  )
}

export function StyledInspectorFooter({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`flex items-center justify-between px-4 py-2 border-t border-border ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function StyledInspectorFooterRow({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function StyledInspectorFooterRowText({ children, className = '', ...props }: React.HTMLProps<HTMLSpanElement>) {
  return (
    <span 
      className={`text-sm text-secondary-foreground ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function StyledPlanInspectorContainer({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`flex flex-col h-full bg-background ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function StyledPlanInspectorContent({ children, className = '', ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`flex-1 overflow-auto p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
