export type RewardTransactionType =
  | 'credit'
  | 'debit'

export type RewardTransaction = {
  id: string
  memberId: string
  type: RewardTransactionType
  amount: number
  reason: string
  sourceKey?: string
  createdAt: string
}

export type RewardMutationResult = {
  transaction: RewardTransaction
  balance: number
  created: boolean
}

type RewardMutationInput = {
  memberId: string
  amount: number
  reason: string
  sourceKey?: string
}

export const REWARDS_UPDATED_EVENT =
  'rental-platform-rewards-updated'

const REWARD_STORAGE_KEY =
  'rental-platform-reward-transactions-v1'

const STARTING_REWARD_BALANCE = 1_120

function readTransactions(): RewardTransaction[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        REWARD_STORAGE_KEY,
      )

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as RewardTransaction[])
      : []
  } catch {
    return []
  }
}

function writeTransactions(
  transactions: RewardTransaction[],
  memberId: string,
) {
  window.localStorage.setItem(
    REWARD_STORAGE_KEY,
    JSON.stringify(transactions),
  )

  window.dispatchEvent(
    new CustomEvent(
      REWARDS_UPDATED_EVENT,
      {
        detail: {
          memberId,
        },
      },
    ),
  )
}

function createTransactionId() {
  return `reward-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`
}

function calculateBalance(
  transactions: RewardTransaction[],
  memberId: string,
) {
  return transactions
    .filter(
      (transaction) =>
        transaction.memberId === memberId,
    )
    .reduce(
      (balance, transaction) =>
        transaction.type === 'credit'
          ? balance + transaction.amount
          : balance - transaction.amount,
      0,
    )
}

function ensureStartingBalance(
  memberId: string,
): RewardTransaction[] {
  const transactions = readTransactions()

  const memberHasTransactions =
    transactions.some(
      (transaction) =>
        transaction.memberId === memberId,
    )

  if (memberHasTransactions) {
    return transactions
  }

  const startingTransaction:
    RewardTransaction = {
      id: createTransactionId(),
      memberId,
      type: 'credit',
      amount: STARTING_REWARD_BALANCE,
      reason: 'Founding member reward balance',
      sourceKey: `starting-balance:${memberId}`,
      createdAt: new Date().toISOString(),
    }

  const nextTransactions = [
    startingTransaction,
    ...transactions,
  ]

  writeTransactions(
    nextTransactions,
    memberId,
  )

  return nextTransactions
}

export function getRewardTransactions(
  memberId: string,
) {
  return ensureStartingBalance(memberId)
    .filter(
      (transaction) =>
        transaction.memberId === memberId,
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )
}

export function getRewardBalance(
  memberId: string,
) {
  const transactions =
    ensureStartingBalance(memberId)

  return calculateBalance(
    transactions,
    memberId,
  )
}

function mutateRewardBalance(
  type: RewardTransactionType,
  input: RewardMutationInput,
): RewardMutationResult {
  const amount = Math.round(
    Number(input.amount),
  )

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      'Reward point adjustments must be greater than zero.',
    )
  }

  const transactions =
    ensureStartingBalance(input.memberId)

  if (input.sourceKey) {
    const existingTransaction =
      transactions.find(
        (transaction) =>
          transaction.memberId ===
            input.memberId &&
          transaction.sourceKey ===
            input.sourceKey,
      )

    if (existingTransaction) {
      return {
        transaction:
          existingTransaction,
        balance: calculateBalance(
          transactions,
          input.memberId,
        ),
        created: false,
      }
    }
  }

  const currentBalance =
    calculateBalance(
      transactions,
      input.memberId,
    )

  if (
    type === 'debit' &&
    amount > currentBalance
  ) {
    throw new Error(
      `Only ${currentBalance.toLocaleString(
        'en-US',
      )} points are currently available.`,
    )
  }

  const transaction:
    RewardTransaction = {
      id: createTransactionId(),
      memberId: input.memberId,
      type,
      amount,
      reason: input.reason.trim(),
      sourceKey: input.sourceKey,
      createdAt: new Date().toISOString(),
    }

  const nextTransactions = [
    transaction,
    ...transactions,
  ]

  writeTransactions(
    nextTransactions,
    input.memberId,
  )

  return {
    transaction,
    balance: calculateBalance(
      nextTransactions,
      input.memberId,
    ),
    created: true,
  }
}

export function creditRewardPoints(
  input: RewardMutationInput,
) {
  return mutateRewardBalance(
    'credit',
    input,
  )
}

export function debitRewardPoints(
  input: RewardMutationInput,
) {
  return mutateRewardBalance(
    'debit',
    input,
  )
}
