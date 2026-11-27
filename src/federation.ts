import { createInstance } from '@module-federation/enhanced/runtime'

export const remoteApps = [
  { id: 'book_library', title: 'Book Library', path: '/books' },
  { id: 'goals_tracker', title: 'Goals Tracker', path: '/goals' },
  { id: 'todo_list', title: 'To-do List', path: '/todos' },
] as const
export type RemoteId = typeof remoteApps[number]['id']
type Dispose = () => void | Promise<void>
interface RemoteApp { mount(container: HTMLElement): Promise<Dispose> }

const runtime = createInstance({ name: 'react_host_v18', remotes: [] })
let configuration: Promise<Record<string, unknown>> | undefined
const modules = new Map<RemoteId, Promise<RemoteApp>>()

function readConfiguration(): Promise<Record<string, unknown>> {
  configuration ??= fetch('/federation.remotes.json', { cache: 'no-store' }).then(async response => {
    if (!response.ok) throw new Error(`Remote configuration failed: HTTP ${response.status}`)
    const value: unknown = await response.json()
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Remote configuration must be a JSON object.')
    }
    return value as Record<string, unknown>
  })
  return configuration
}

function load(id: RemoteId): Promise<RemoteApp> {
  const existing = modules.get(id)
  if (existing) return existing
  const loading = readConfiguration().then(async config => {
    const entry = config[id]
    if (typeof entry !== 'string') throw new Error(`Missing remote URL for ${id}.`)
    const url = new URL(entry, window.location.href)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Invalid remote URL for ${id}.`)
    runtime.registerRemotes([{ name: id, entry: url.href, type: 'global', entryGlobalName: id }])
    const value = await runtime.loadRemote<unknown>(`${id}/mount`)
    if (!value || typeof value !== 'object' || !('mount' in value) || typeof value.mount !== 'function') {
      throw new Error(`${id} does not expose a mount function.`)
    }
    return value as RemoteApp
  })
  modules.set(id, loading)
  return loading
}

export function activateRemote(
  container: HTMLElement,
  id: RemoteId,
  ready: () => void,
  failed: (error: unknown) => void,
): () => void {
  const target = document.createElement('div')
  container.append(target)
  let cancelled = false
  let dispose: Dispose | undefined
  void (async () => {
    try {
      const remote = await load(id)
      if (cancelled) return
      const cleanup = await remote.mount(target)
      if (typeof cleanup !== 'function') throw new Error(`${id} did not return a disposer.`)
      if (cancelled) await cleanup()
      else { dispose = cleanup; ready() }
    } catch (error) {
      target.remove()
      console.error(`Remote ${id} failed`, error)
      if (!cancelled) failed(error)
    }
  })()
  return () => {
    if (cancelled) return
    cancelled = true
    target.remove()
    if (dispose) {
      const cleanup = dispose
      void Promise.resolve().then(cleanup).catch(error => console.error(`Cleanup failed for ${id}`, error))
    }
  }
}
