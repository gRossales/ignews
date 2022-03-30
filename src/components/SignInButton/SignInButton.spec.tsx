import { render, screen, fireEvent } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { signIn, signOut, useSession } from 'next-auth/client'
import { SignInButton } from '.'

jest.mock('next-auth/client')

describe('SignInButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SignInButton />)

    expect(screen.getByText('Sign in with GitHub')).toBeInTheDocument()
  })

  it('renders correctly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' },
      false
    ])

    render(<SignInButton />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('sign in when clicked and not authenticated', () => {
    const useSessionMocked = mocked(useSession)
    const signInMocked = mocked(signIn)

    useSessionMocked.mockReturnValueOnce([null, false])
    
    render(<SignInButton />)
    const signInButton = screen.getByText(/sign in with github/i)
    
    fireEvent.click(signInButton)

    expect(signInMocked).toHaveBeenCalledWith('github')
  })

  it('sign out when clicked and authenticated', () => {
    const useSessionMocked = mocked(useSession)
    const signOutMocked = mocked(signOut)

    useSessionMocked.mockReturnValueOnce([
      { user: { name: 'John Doe', email: 'john.doe@example.com' }, expires: 'fake-expires' },
      false
    ])
    
    render(<SignInButton />)
        
    const signInButton = screen.getByRole('button', {name: 'John Doe'})
    
    fireEvent.click(signInButton)

    expect(signOutMocked).toHaveBeenCalled()
  })
})

