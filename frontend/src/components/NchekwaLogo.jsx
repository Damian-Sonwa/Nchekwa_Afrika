import { motion } from 'framer-motion'

/**
 * Nchekwa Logo Component
 * 
 * Two hands cupping together in a circular shield shape
 * Represents protection, support, and safety
 */

export const NchekwaLogo = ({ size = 'w-24 h-24', className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3 }}
      className={`${size} bg-primary rounded-2xl shadow-md border-4 border-white dark:border-slate-800 flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-12 h-12 text-white"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer protective circle/shield */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.4"
        />
        
        {/* Left Hand - Cupping from left side */}
        <g opacity="0.95">
          {/* Left palm */}
          <ellipse cx="30" cy="50" rx="8" ry="12" />
          {/* Left thumb */}
          <ellipse cx="22" cy="45" rx="4" ry="6" transform="rotate(-20 22 45)" />
          {/* Left fingers */}
          <ellipse cx="28" cy="38" rx="3" ry="7" transform="rotate(-10 28 38)" />
          <ellipse cx="32" cy="35" rx="3" ry="7" transform="rotate(5 32 35)" />
          <ellipse cx="35" cy="38" rx="3" ry="6" transform="rotate(15 35 38)" />
          <ellipse cx="36" cy="42" rx="2.5" ry="5" transform="rotate(20 36 42)" />
        </g>
        
        {/* Right Hand - Cupping from right side */}
        <g opacity="0.95">
          {/* Right palm */}
          <ellipse cx="70" cy="50" rx="8" ry="12" />
          {/* Right thumb */}
          <ellipse cx="78" cy="45" rx="4" ry="6" transform="rotate(20 78 45)" />
          {/* Right fingers */}
          <ellipse cx="72" cy="38" rx="3" ry="7" transform="rotate(10 72 38)" />
          <ellipse cx="68" cy="35" rx="3" ry="7" transform="rotate(-5 68 35)" />
          <ellipse cx="65" cy="38" rx="3" ry="6" transform="rotate(-15 65 38)" />
          <ellipse cx="64" cy="42" rx="2.5" ry="5" transform="rotate(-20 64 42)" />
        </g>
        
        {/* Inner circle - representing what's being protected */}
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="currentColor"
          opacity="0.25"
        />
        
        {/* Center symbol - small heart or circle representing safety */}
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="currentColor"
          opacity="0.6"
        />
      </svg>
    </motion.div>
  )
}

export default NchekwaLogo


