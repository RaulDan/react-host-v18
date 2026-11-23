import { useEffect, useRef, useState } from 'react'
import type { RemoteId } from './federation/contract'
import { activateRemote } from './federation/lifecycle'
import { loadRemoteApp } from './federation/runtime'
import { Link } from 'react-router-dom'

interface Props {
  remoteId: RemoteId
  title: string
  framework: string
  path: string
}

export default function RemotePanel({ remoteId, title, framework, path }: Props) {
  const outlet = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const target = document.createElement('div')
    outlet.current?.append(target)
    const stop = activateRemote(
      async () => (await loadRemoteApp(remoteId)).mount(target),
      () => setStatus('ready'),
      (error) => {
        console.error(`Failed to mount ${remoteId}`, error)
        setErrorMessage(error instanceof Error ? error.message : 'Unknown remote error.')
        setStatus('error')
        target.replaceChildren()
      },
      (error) => console.error(`Failed to dispose ${remoteId}`, error),
    )
    return () => {
      stop()
      target.remove()
    }
  }, [remoteId])

  return (
    <section className="remote-panel" aria-labelledby={`${remoteId}-heading`} aria-busy={status === 'loading'}>
      <header>
        <Link id={`${remoteId}-heading`} to={path}>{title}</Link>
        <span>{framework}</span>
      </header>
      {status === 'loading' && <p role="status">Loading {title}...</p>}
      {status === 'error' && <p role="alert">Could not load {title}. {errorMessage}</p>}
      <div ref={outlet} />
    </section>
  )
}
