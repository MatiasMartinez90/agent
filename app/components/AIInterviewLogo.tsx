import Image from 'next/image'

interface AIInterviewLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const AIInterviewLogo: React.FC<AIInterviewLogoProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const heightSizes = {
    sm: 'h-8',
    md: 'h-10', 
    lg: 'h-14',
    xl: 'h-20'
  }

  const widthSizes = {
    sm: 'w-32',
    md: 'w-40', 
    lg: 'w-56',
    xl: 'w-80'
  }

  return (
    <div className={`${heightSizes[size]} ${widthSizes[size]} ${className} relative`}>
      <Image
        src="/ai-interview-logo.svg"
        alt="AI Interview"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

export default AIInterviewLogo