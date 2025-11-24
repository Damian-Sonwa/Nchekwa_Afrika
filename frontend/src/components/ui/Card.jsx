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
        'bg-white rounded-xl shadow-md border border-gray-200',
        hover && 'hover:shadow-xl transition-shadow duration-300',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}


