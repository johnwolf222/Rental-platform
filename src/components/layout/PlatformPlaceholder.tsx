import { Link } from 'react-router'

type PlatformPlaceholderProps = {
  status?: string
  title: string
  description: string
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
}

function PlatformPlaceholder({
  status = 'Foundation ready',
  title,
  description,
  primaryLabel = 'Return to search',
  primaryTo = '/',
  secondaryLabel,
  secondaryTo = '/',
}: PlatformPlaceholderProps) {
  return (
    <article className="platform-placeholder">
      <span className="platform-placeholder__status">{status}</span>

      <h2>{title}</h2>
      <p>{description}</p>

      <div className="platform-placeholder__actions">
        <Link to={primaryTo}>{primaryLabel}</Link>

        {secondaryLabel && (
          <Link to={secondaryTo}>{secondaryLabel}</Link>
        )}
      </div>
    </article>
  )
}

export default PlatformPlaceholder
