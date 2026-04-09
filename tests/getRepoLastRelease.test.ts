import { expect, test } from 'vitest'
import { getRepoLastRelease } from '../src/utils/getRepoLastRelease'

test('empty release page result', async () => {
  const result = await getRepoLastRelease([])
  expect(result).toBe(undefined)
})

test('get new release published once', async () => {
  const result = await getRepoLastRelease([
    { published_at: '2024-01-01T00:00:00Z' },
  ])
  expect(result).toBe('2024-01-01T00:00:00Z')
})

test('get new release published multiple times', async () => {
  const result = await getRepoLastRelease([
    { published_at: '2024-01-01T00:00:00Z' },
    { published_at: '2024-02-01T00:00:00Z' },
    { published_at: '2024-03-01T00:00:00Z' },
  ])
  expect(result).toBe('2024-03-01T00:00:00Z')
})