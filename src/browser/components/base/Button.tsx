interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = ({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) => {
  const baseStyles = 'rounded font-medium transition-fast focus:outline-none focus:ring-2'
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-surface-secondary dark:bg-surface-secondary-dark hover:bg-opacity-80',
    ghost: 'hover:bg-surface-secondary dark:hover:bg-surface-secondary-dark'
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
} 