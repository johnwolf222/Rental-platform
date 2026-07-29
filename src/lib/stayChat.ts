export type StayChatSenderRole =
  | 'member'
  | 'manager'

export type StayChatMessage = {
  id: string
  reservationId: string
  senderRole: StayChatSenderRole
  senderName: string
  message: string
  createdAt: string
}

type SendStayMessageInput = {
  reservationId: string
  senderRole: StayChatSenderRole
  senderName: string
  message: string
}

export const STAY_CHAT_UPDATED_EVENT =
  'rental-platform-stay-chat-updated'

const STAY_CHAT_STORAGE_KEY =
  'rental-platform-stay-chat-v1'

function readThreads(): Record<
  string,
  StayChatMessage[]
> {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        STAY_CHAT_STORAGE_KEY,
      )

    if (!storedValue) {
      return {}
    }

    const parsedValue = JSON.parse(storedValue)

    return parsedValue &&
      typeof parsedValue === 'object'
      ? (parsedValue as Record<
          string,
          StayChatMessage[]
        >)
      : {}
  } catch {
    return {}
  }
}

function writeThreads(
  threads: Record<
    string,
    StayChatMessage[]
  >,
) {
  window.localStorage.setItem(
    STAY_CHAT_STORAGE_KEY,
    JSON.stringify(threads),
  )
}

function createMessageId() {
  return `message-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`
}

export function getStayMessages(
  reservationId: string,
  propertyTitle: string,
): StayChatMessage[] {
  const threads = readThreads()
  const existingThread =
    threads[reservationId]

  if (
    Array.isArray(existingThread) &&
    existingThread.length > 0
  ) {
    return existingThread
  }

  const welcomeMessage: StayChatMessage = {
    id: createMessageId(),
    reservationId,
    senderRole: 'manager',
    senderName: 'Property Manager',
    message:
      `Welcome to your private ${propertyTitle} reservation chat. Send us a message here whenever you need assistance before or during your stay.`,
    createdAt: new Date().toISOString(),
  }

  const nextThreads = {
    ...threads,
    [reservationId]: [welcomeMessage],
  }

  writeThreads(nextThreads)

  return [welcomeMessage]
}

export function sendStayMessage(
  input: SendStayMessageInput,
): StayChatMessage {
  const trimmedMessage =
    input.message.trim()

  if (!trimmedMessage) {
    throw new Error(
      'A chat message cannot be empty.',
    )
  }

  const threads = readThreads()

  const message: StayChatMessage = {
    id: createMessageId(),
    reservationId: input.reservationId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    message: trimmedMessage,
    createdAt: new Date().toISOString(),
  }

  const currentThread = Array.isArray(
    threads[input.reservationId],
  )
    ? threads[input.reservationId]
    : []

  writeThreads({
    ...threads,
    [input.reservationId]: [
      ...currentThread,
      message,
    ],
  })

  window.dispatchEvent(
    new CustomEvent(
      STAY_CHAT_UPDATED_EVENT,
      {
        detail: {
          reservationId:
            input.reservationId,
        },
      },
    ),
  )

  return message
}
