import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Reusable Button Component - Trauma-Informed Design
 * 
 * Usage:
 * <Button variant="primary" size="lg">Click Me</Button>
 * 
 * Variants: primary, secondary, outline, danger
 * Sizes: sm, md, lg
 */

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  ...props
}) {
  const baseStyles = 'font-heading font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary text-white shadow-md hover:bg-primary-dark hover:shadow-lg focus:ring-accent dark:bg-primary dark:hover:bg-primary-dark',
    secondary: 'bg-background-light text-text-main hover:bg-primary-light border border-primary-light dark:bg-background-dark dark:text-white dark:border-primary dark:hover:bg-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light dark:hover:bg-primary dark:hover:text-white',
    danger: 'bg-error text-white hover:bg-error/90 shadow-md hover:shadow-lg focus:ring-error',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}


