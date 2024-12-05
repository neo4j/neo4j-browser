import React from 'react'
import { buttonStyles } from '../../styles/commonStyles'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  icon,
  ...props 
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button 
      className={`
        ${buttonStyles.base}
        ${buttonStyles[variant]}
        ${sizeClasses[size]}
        ${icon ? 'inline-flex items-center gap-2' : ''}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
} 