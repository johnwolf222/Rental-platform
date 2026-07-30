/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  MEMBERSHIP_TERMS,
  PRIVACY_POLICY,
} from '../data/legal'

export type MemberRole = 'member' | 'manager'

export type LegalAcceptance = {
  termsVersion: string
  privacyVersion: string
  termsViewedAt: string
  privacyViewedAt: string
  acceptedAt: string
}

export type MemberAccount = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: MemberRole
  marketingOptIn: boolean
  legalAcceptance: LegalAcceptance
  createdAt: string
  lastLoginAt: string
}

type SignUpInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  marketingOptIn: boolean
  termsViewedAt: string
  privacyViewedAt: string
}

type SignInInput = {
  email: string
  password: string
}

type AuthResult = {
  success: boolean
  error?: string
}

type AuthContextValue = {
  user: MemberAccount | null
  isAuthenticated: boolean
  signUp: (input: SignUpInput) => AuthResult
  signIn: (input: SignInInput) => AuthResult
  signOut: () => void
}

const ACTIVE_USER_KEY = 'rental-platform-active-user-v1'
const ACCOUNTS_KEY = 'rental-platform-prototype-accounts-v1'

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

function readStoredValue<T>(
  key: string,
  fallback: T,
): T {
  try {
    const storedValue = window.localStorage.getItem(key)

    if (!storedValue) {
      return fallback
    }

    return JSON.parse(storedValue) as T
  } catch {
    return fallback
  }
}

function writeStoredValue(
  key: string,
  value: unknown,
) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function createAccountId() {
  return `member-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<MemberAccount | null>(() =>
    readStoredValue<MemberAccount | null>(
      ACTIVE_USER_KEY,
      null,
    ),
  )

  const signUp = (input: SignUpInput): AuthResult => {
    const normalizedEmail = input.email.trim().toLowerCase()

    const accounts = readStoredValue<MemberAccount[]>(
      ACCOUNTS_KEY,
      [],
    )

    const accountAlreadyExists = accounts.some(
      (account) =>
        account.email.toLowerCase() === normalizedEmail,
    )

    if (accountAlreadyExists) {
      return {
        success: false,
        error:
          'An account with this email already exists in this browser.',
      }
    }

    const now = new Date().toISOString()

    const account: MemberAccount = {
      id: createAccountId(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      role: 'member',
      marketingOptIn: input.marketingOptIn,
      legalAcceptance: {
        termsVersion: MEMBERSHIP_TERMS.version,
        privacyVersion: PRIVACY_POLICY.version,
        termsViewedAt: input.termsViewedAt,
        privacyViewedAt: input.privacyViewedAt,
        acceptedAt: now,
      },
      createdAt: now,
      lastLoginAt: now,
    }

    writeStoredValue(ACCOUNTS_KEY, [...accounts, account])
    writeStoredValue(ACTIVE_USER_KEY, account)
    setUser(account)

    return { success: true }
  }

  const signIn = ({
    email,
    password,
  }: SignInInput): AuthResult => {
    if (password.length < 8) {
      return {
        success: false,
        error: 'Enter the password used for this prototype account.',
      }
    }

    const normalizedEmail = email.trim().toLowerCase()

    const accounts = readStoredValue<MemberAccount[]>(
      ACCOUNTS_KEY,
      [],
    )

    const account = accounts.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail,
    )

    if (!account) {
      return {
        success: false,
        error:
          'No prototype account was found for this email. Create an account first.',
      }
    }

    const updatedAccount: MemberAccount = {
      ...account,
      lastLoginAt: new Date().toISOString(),
    }

    const updatedAccounts = accounts.map((candidate) =>
      candidate.id === updatedAccount.id
        ? updatedAccount
        : candidate,
    )

    writeStoredValue(ACCOUNTS_KEY, updatedAccounts)
    writeStoredValue(ACTIVE_USER_KEY, updatedAccount)
    setUser(updatedAccount)

    return { success: true }
  }

  const signOut = () => {
    window.localStorage.removeItem(ACTIVE_USER_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider.',
    )
  }

  return context
}

export {
  AuthProvider,
  useAuth,
}
