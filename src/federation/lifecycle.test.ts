import assert from 'node:assert/strict'
import { test } from 'node:test'
import { activateRemote } from './lifecycle.ts'
import type { Dispose } from './contract'

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

test('a completed mount is disposed exactly once', async () => {
  let ready = 0
  let disposed = 0
  const errors: unknown[] = []
  const stop = activateRemote(async () => () => { disposed++ }, () => { ready++ }, (e) => errors.push(e), (e) => errors.push(e))
  await tick()
  stop()
  stop()
  await tick()
  assert.equal(ready, 1)
  assert.equal(disposed, 1)
  assert.deepEqual(errors, [])
})

test('a mount resolving after destruction is cleaned up without notifying readiness', async () => {
  let finish!: (value: Dispose) => void
  let ready = 0
  let disposed = 0
  const errors: unknown[] = []
  const pending = new Promise<Dispose>((resolve) => { finish = resolve })
  const stop = activateRemote(() => pending, () => { ready++ }, (e) => errors.push(e), (e) => errors.push(e))
  stop()
  finish(async () => { disposed++ })
  await tick()
  assert.equal(ready, 0)
  assert.equal(disposed, 1)
  assert.deepEqual(errors, [])
})

test('mount failures are surfaced', async () => {
  const failure = new Error('mount failed')
  const errors: unknown[] = []
  activateRemote(() => Promise.reject(failure), () => assert.fail('not ready'), (e) => errors.push(e), (e) => errors.push(e))
  await tick()
  assert.deepEqual(errors, [failure])
})

test('asynchronous cleanup failures are reported', async () => {
  const failure = new Error('cleanup failed')
  const errors: unknown[] = []
  const stop = activateRemote(async () => () => Promise.reject(failure), () => {}, (e) => errors.push(e), (e) => errors.push(e))
  await tick()
  stop()
  await tick()
  assert.deepEqual(errors, [failure])
})
