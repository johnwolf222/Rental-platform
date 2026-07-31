import type {
  ReservationHistoryEvent,
} from '../../lib/reservations'

const dateFormatter =
  new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  )

export default function ReservationTimeline({
  events,
}: {
  events: ReservationHistoryEvent[]
}) {
  const orderedEvents = [
    ...events,
  ].sort(
    (first, second) =>
      new Date(
        second.createdAt,
      ).getTime() -
      new Date(
        first.createdAt,
      ).getTime(),
  )

  return (
    <ol className="reservation-timeline">
      {orderedEvents.map((event) => (
        <li key={event.id}>
          <i aria-hidden="true" />

          <div>
            <header>
              <strong>{event.title}</strong>

              <time
                dateTime={event.createdAt}
              >
                {dateFormatter.format(
                  new Date(
                    event.createdAt,
                  ),
                )}
              </time>
            </header>

            <p>{event.detail}</p>

            <small>
              Updated by {event.actor}
            </small>
          </div>
        </li>
      ))}
    </ol>
  )
}
