import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { mocked } from 'ts-jest/utils'
import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { SubscribeButton } from '.'
import { api } from '../../services/api'
import { getStripeJs } from '../../services/stripe-js'

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/api');
jest.mock('../../services/stripe-js');

describe('SubscribeButton component', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])
    render(<SubscribeButton />)

    expect(screen.getByText('Subscribe now')).toBeInTheDocument()
  })

  it('redirects user to sign in when not authenticated', () => {
    const signInMocked = mocked(signIn)
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    expect(signInMocked).toHaveBeenCalled()
  })

  it('redirects to posts when user already has a subscription', () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMocked = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        activeSubscription: 'fake-active-subscription',
        expires: 'fake-expires'
      },
      false
    ])

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any)

    render(<SubscribeButton />)
    
    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    expect(pushMocked).toHaveBeenCalledWith('/posts')
  })

  it('redirects to stripe checkout if user dont have a active subscription', async () => {
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([
      {
        user: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        activeSubscription: null,
        expires: 'fake-expires'
      },
      false
    ])
    const apiPostMocked = mocked(api.post)
    
    apiPostMocked.mockResolvedValue({
      data: { sessionId: 'fake-session-id' }
    } as any)

    const stripeMocked = mocked(getStripeJs)
    const redirectToCheckoutMock = jest.fn().mockResolvedValueOnce(undefined)

    stripeMocked.mockResolvedValue({
      redirectToCheckout: redirectToCheckoutMock
    }as any)

    render(<SubscribeButton />)

    const subscribeButton = screen.getByText('Subscribe now');

    fireEvent.click(subscribeButton)

    expect(apiPostMocked).toHaveBeenCalledWith('/subscribe')
    waitFor(()=>{
      return expect(redirectToCheckoutMock).toHaveBeenCalledWith({data: { sessionId: 'fake-session-id' }})
    })
  })

})

