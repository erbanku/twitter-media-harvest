import { init } from './sentry'
import {
  captureConsoleIntegration,
  consoleLoggingIntegration,
  init as sentryInit,
  setUser as setSentryUser,
} from '@sentry/browser'

jest.mock('@sentry/browser', () => ({
  captureConsoleIntegration: jest.fn(() => 'capture-console-integration'),
  consoleLoggingIntegration: jest.fn(() => 'console-logging-integration'),
  defaultStackParser: 'default-stack-parser',
  init: jest.fn(),
  makeFetchTransport: 'fetch-transport',
  setUser: jest.fn(),
}))

describe('sentry monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('skips sentry initialization when dsn is invalid', () => {
    process.env.SENTRY_DSN = 'sentry-dsn-url'
    const userProvider = jest.fn().mockResolvedValue({ clientId: 'client-id' })

    init({ providers: { user: userProvider } })

    expect(sentryInit).not.toHaveBeenCalled()
    expect(captureConsoleIntegration).not.toHaveBeenCalled()
    expect(consoleLoggingIntegration).not.toHaveBeenCalled()
    expect(userProvider).not.toHaveBeenCalled()
    expect(setSentryUser).not.toHaveBeenCalled()
  })

  it('initializes sentry and sets user when dsn is valid', async () => {
    process.env.SENTRY_DSN = 'https://public@example.ingest.sentry.io/123456'
    const userProvider = jest.fn().mockResolvedValue({ clientId: 'client-id' })

    init({ providers: { user: userProvider } })
    await Promise.resolve()

    expect(captureConsoleIntegration).toHaveBeenCalledOnce()
    expect(sentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.ingest.sentry.io/123456',
        integrations: ['capture-console-integration'],
      })
    )
    expect(userProvider).toHaveBeenCalledOnce()
    expect(setSentryUser).toHaveBeenCalledWith({ client_id: 'client-id' })
  })
})
