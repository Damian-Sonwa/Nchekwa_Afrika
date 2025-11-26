import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Reusable Input Component
 * 
 * Usage:
 * <Input 
 *   type="email" 
 *   placeholder="Email" 
 *   icon={Mail}
 *   error="Error message"
 * />
 */

export default function Input({
  icon: Icon,
  error,
  className,
  ...props
}) {
  return (
    <div>
      <motion.div
        whileFocus={{ scale: 1.02 }}
        className="relative"
      >
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={cn(
              "w-5 h-5",
              error ? "text-error" : "text-text-secondary"
            )} />
          </div>
        )}
        <input
          className={cn(
            "w-full rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200",
            Icon && "pl-12 pr-4",
            !Icon && "px-4",
            "py-3",
            error
              ? "border-error focus:border-error focus:ring-error/20 bg-background text-text-main"
              : "border-accent/20 focus:border-accent focus:ring-accent/20 bg-background text-text-main",
            className
          )}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error flex items-center space-x-1"
        >
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  )
}


