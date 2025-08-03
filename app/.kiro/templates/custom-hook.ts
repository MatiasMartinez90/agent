import { useState, useEffect, useCallback } from 'react'

interface Use{{HookName}}Options {
  // Define options interface
  initialValue?: any
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface Use{{HookName}}Return {
  // Define return type interface
  data: any | null
  loading: boolean
  error: Error | null
  // Add your specific return values
}

/**
 * use{{HookName}} - Brief description of what this hook does
 * 
 * @param options - Hook configuration options
 * @returns Hook state and methods
 */
export const use{{HookName}} = (options: Use{{HookName}}Options = {}): Use{{HookName}}Return => {
  const { initialValue, onSuccess, onError } = options
  
  // State management
  const [data, setData] = useState<any | null>(initialValue || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Main hook logic
  const executeAction = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Your async logic here
      const result = await someAsyncOperation()
      
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [onSuccess, onError])
  
  // Effects
  useEffect(() => {
    // Initialization logic
  }, [])
  
  return {
    data,
    loading,
    error,
    executeAction,
    // Add your specific return values
  }
}

// Usage example:
// const { data, loading, error, executeAction } = use{{HookName}}({
//   onSuccess: (data) => console.log('Success:', data),
//   onError: (error) => console.error('Error:', error)
// })