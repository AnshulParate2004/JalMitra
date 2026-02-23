import React from 'react'

interface AnimateInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/** Wrapper for fade-in + slide-up animation. Use delay for staggered sequence. */
export function AnimateIn({ children, className = '', delay = 0 }: AnimateInProps) {
  return (
    <div className={`animate-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
