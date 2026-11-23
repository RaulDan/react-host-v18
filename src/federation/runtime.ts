import { createInstance } from '@module-federation/enhanced/runtime'
import type { RemoteApp, RemoteDefinition, RemoteId } from './contract'

const requiredRemotes: RemoteId[] = ['book_library', 'goals_tracker', 'todo_list']
let runtime: Promise<ReturnType<typeof createInstance>> | undefined

function isRemote(value: unknown): value is RemoteDefinition {
  return typeof value === 'object' && value !== null &&
    'name' in value && requiredRemotes.some((name) => name === value.name) &&
    'entry' in value && typeof value.entry === 'string' && /^https?:\/\//.test(value.entry) &&
    'type' in value && (value.type === 'var' || value.type === 'module')
}

async function initializeRuntime() {
  const response = await fetch(`${import.meta.env.BASE_URL}federation.remotes.json`)
  if (!response.ok) throw new Error(`Remote configuration failed: HTTP ${response.status}.`)
  const remotes: unknown = await response.json()
  if (!Array.isArray(remotes) || !remotes.every(isRemote) ||
      remotes.length !== requiredRemotes.length ||
      new Set(remotes.map((remote) => remote.name)).size !== requiredRemotes.length) {
    throw new Error('Invalid federation.remotes.json: expected all three named remote entries.')
  }
  return createInstance({ name: 'react_host_v18', remotes, shared: {} })
}

export async function loadRemoteApp(id: RemoteId): Promise<RemoteApp> {
  runtime ??= initializeRuntime()
  const instance = await runtime
  const module = await instance.loadRemote<RemoteApp>(`${id}/mount`)
  if (!module || typeof module.mount !== 'function') {
    throw new Error(`${id} does not expose a valid mount function.`)
  }
  return module
}
