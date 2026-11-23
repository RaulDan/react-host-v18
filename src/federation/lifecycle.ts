import type { Dispose } from './contract'

export function activateRemote(
  start: () => Promise<Dispose>,
  onReady: () => void,
  onError: (error: unknown) => void,
  reportCleanupError: (error: unknown) => void,
): () => void {
  let cancelled = false
  let dispose: Dispose | undefined

  void (async () => {
    try {
      const cleanup = await start()
      if (typeof cleanup !== 'function') throw new Error('Remote mount did not return a disposer.')
      if (cancelled) {
        await cleanup()
      } else {
        dispose = cleanup
        onReady()
      }
    } catch (error) {
      if (cancelled) reportCleanupError(error)
      else onError(error)
    }
  })()

  return () => {
    if (cancelled) return
    cancelled = true
    const cleanup = dispose
    dispose = undefined
    if (cleanup) void Promise.resolve().then(cleanup).catch(reportCleanupError)
  }
}
