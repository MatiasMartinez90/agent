import { NextPage } from 'next'
import Router from 'next/router'
import { useEffect } from 'react'
import useUser from '../lib/useUser'

const Admin: NextPage = () => {
  const { user, loading, loggedOut } = useUser({ redirect: '/signin' })
  
  useEffect(() => {
    if (user && !loading && !loggedOut) {
      Router.push('/chat')
    }
  }, [user, loading, loggedOut])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
    </div>
  )
  
  if (loggedOut) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-gray-400">Redirigiendo al login...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <div className="text-white">Redirigiendo al chat...</div>
      </div>
    </div>
  )
}

export default Admin
