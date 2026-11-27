import { useEffect, useRef, useState } from 'react'
import { activateRemote, type RemoteId } from './federation'

export default function RemotePanel({ remote }: { remote: RemoteId }) {
  const surface = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const target = surface.current
    if (!target) throw new Error('Remote panel surface is missing.')
    return activateRemote(
      target,
      remote,
      () => setLoading(false),
      error => {
        setLoading(false)
        setError(error instanceof Error ? error.message : 'Application could not be loaded.')
      },
    )
  }, [remote])

  return <>
    {loading && <p role="status">Loading application...</p>}
    {error && <p role="alert">{error} Reload the page to try again.</p>}
    <div ref={surface} />
  </>
}
