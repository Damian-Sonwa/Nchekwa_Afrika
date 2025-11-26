import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * Reusable Card Component
 * 
 * Usage:
 * <Card className="p-6">Content</Card>
 */

export default function Card({ 
  children, 
  className,
  hover = false,
  ...props 
}) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      className={cn(
        'bg-card rounded-xl shadow-md border',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        className
      )}
      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
