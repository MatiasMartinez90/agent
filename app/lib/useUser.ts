import Router from 'next/router'
import useSWR, { useSWRConfig } from 'swr'
import { Auth } from 'aws-amplify'

const fetcher = async () => {
  const user = await Auth.currentAuthenticatedUser()
  
  // Extract user attributes including Google profile picture
  const userAttributes = await Auth.userAttributes(user)
  const attributesMap = userAttributes.reduce((acc, attr) => {
    acc[attr.getName()] = attr.getValue()
    return acc
  }, {})
  
  return {
    ...user,
    attributes: attributesMap,
    name: attributesMap.name,
    email: attributesMap.email,
    picture: attributesMap.picture, // Google profile picture
  }
}

export default function useUser({ redirect = '' } = {}) {
  const { cache } = useSWRConfig()
  const { data: user, error } = useSWR('user', fetcher)

  const loading = !user && !error
  const loggedOut = error && error === 'The user is not authenticated'

  if (loggedOut && redirect) {
    Router.push({ pathname: redirect, query: { redirect: Router.asPath } })
  }

  const signOut = async ({ redirect = '/' }) => {
    cache.delete('user')
    await Router.push(redirect)
    await Auth.signOut()
  }

  return { loading, loggedOut, user, signOut }
}
