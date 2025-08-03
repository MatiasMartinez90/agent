import React from 'react'

interface {{ComponentName}}Props {
  // Define your props here
  className?: string
  children?: React.ReactNode
}

/**
 * {{ComponentName}} - Brief description of what this component does
 * 
 * @param props - Component props
 * @returns JSX element
 */
const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  className = '',
  children,
  ...props
}) => {
  // Component logic here
  
  return (
    <div 
      className={`{{ComponentName}}-container ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default {{ComponentName}}

// Usage example:
// <{{ComponentName}} className="custom-class">
//   Content here
// </{{ComponentName}}>