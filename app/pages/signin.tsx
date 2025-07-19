import { NextPage } from 'next'
import Router from 'next/router'
import { useSWRConfig } from 'swr'
import { Authenticator, useAuthenticator, CheckboxField, AmplifyProvider, Theme } from '@aws-amplify/ui-react'

const themeCustom: Theme = {
  name: 'custom',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: { value: 'rgba(99, 102, 241, 0.1)' },
          20: { value: 'rgba(99, 102, 241, 0.2)' },
          40: { value: 'rgba(99, 102, 241, 0.4)' },
          60: { value: 'rgba(99, 102, 241, 0.6)' },
          80: { value: 'rgb(99, 102, 241)' },
          90: { value: 'rgb(99, 102, 241)' },
          100: { value: 'rgb(99, 102, 241)' },
        },
      },
    },
  },
}

const AuthUI: NextPage = () => {
  const { route } = useAuthenticator((context) => [context.route])
  const { cache } = useSWRConfig()

  if (route === 'authenticated') {
    cache.delete('user')
    const redirect = Router.query.redirect || '/'
    Router.push(redirect + '')
    return <>Redirect...</>
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and title */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <span className="text-3xl font-bold text-indigo-600">DemoApp</span>
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded uppercase font-bold">DEMO</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Authenticator */}
          <div className="mt-8">
            <Authenticator
              socialProviders={['google']}
              loginMechanisms={['email']}
              components={{
                SignUp: {
                  FormFields() {
                    const { validationErrors } = useAuthenticator()
                    return (
                      <>
                        <Authenticator.SignUp.FormFields />
                        <CheckboxField
                          hasError={!!validationErrors.acknowledgement}
                          name="acknowledgement"
                          value="yes"
                          label={
                            <>
                              I agree with the{' '}
                              <a
                                href="https://aws.amazon.com/terms"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#6366f1', textDecoration: 'underline' }}
                              >
                                Terms & Conditions
                              </a>
                            </>
                          }
                        />
                      </>
                    )
                  },
                },
              }}
              services={{
                async validateCustomSignUp(formData) {
                  if (!formData.acknowledgement) {
                    return {
                      acknowledgement: 'You must agree to the Terms & Conditions',
                    }
                  }
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Stars */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-32 left-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-40 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-32 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        </div>

        {/* Shooting stars */}
        <div className="absolute top-16 right-16 w-8 h-0.5 bg-gradient-to-r from-white to-transparent transform rotate-45"></div>
        <div className="absolute top-32 left-16 w-6 h-0.5 bg-gradient-to-r from-white to-transparent transform rotate-12"></div>

        {/* Clouds */}
        <div className="absolute bottom-32 left-8 w-16 h-8 bg-blue-300 rounded-full opacity-60"></div>
        <div className="absolute bottom-28 left-12 w-12 h-6 bg-blue-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-40 right-20 w-20 h-10 bg-purple-300 rounded-full opacity-60"></div>
        <div className="absolute bottom-36 right-24 w-16 h-8 bg-purple-400 rounded-full opacity-60"></div>

        {/* Mountains */}
        <div className="absolute bottom-20 left-0 w-32 h-32 bg-gradient-to-t from-orange-500 to-yellow-400 transform skew-x-12"></div>
        <div className="absolute bottom-16 left-20 w-40 h-40 bg-gradient-to-t from-orange-600 to-yellow-500 transform -skew-x-6"></div>
        <div className="absolute bottom-12 right-20 w-36 h-36 bg-gradient-to-t from-orange-500 to-yellow-400 transform skew-x-12"></div>
        <div className="absolute bottom-8 right-0 w-32 h-32 bg-gradient-to-t from-orange-600 to-yellow-500 transform -skew-x-6"></div>

        {/* Rocket */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-16 bg-gradient-to-t from-orange-400 to-white rounded-t-full relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-full"></div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-t from-orange-400 to-transparent rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Launch cloud */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-white rounded-full opacity-80"></div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-white rounded-full opacity-60"></div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h3 className="text-4xl font-bold mb-4">Launch Your Career</h3>
            <p className="text-xl opacity-90">Learn Cloud & DevOps with hands-on projects</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const SignIn: NextPage = () => {
  return (
    <AmplifyProvider theme={themeCustom}>
      <Authenticator.Provider>
        <AuthUI />
      </Authenticator.Provider>
    </AmplifyProvider>
  )
}

export default SignIn
