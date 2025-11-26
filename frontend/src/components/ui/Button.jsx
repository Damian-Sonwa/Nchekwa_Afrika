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
    primary: 'bg-accent text-primary shadow-md hover:bg-accent-gold hover:shadow-lg focus:ring-accent',
    secondary: 'bg-background text-text-main hover:bg-accent/10 border border-accent/20',
    outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-primary',
    danger: 'bg-error text-text-main hover:bg-error/90 shadow-md hover:shadow-lg focus:ring-error',
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


